"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/current-user";

export async function addAssignment(formData: FormData) {
  const { supabase } = await requireAdmin();

  const student_id = String(formData.get("student_id") ?? "");
  const teacher_id = String(formData.get("teacher_id") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();

  if (!student_id || !teacher_id || !subject) {
    throw new Error("선생님과 과목을 모두 선택/입력해주세요.");
  }

  const { error } = await supabase
    .from("student_teachers")
    .insert({ student_id, teacher_id, subject });

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 동일한 선생님-과목 배정이 존재합니다.");
    }
    throw new Error(error.message);
  }

  revalidatePath(`/admin/students/${student_id}`);
}

export async function removeAssignment(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("assignment_id") ?? "");
  const student_id = String(formData.get("student_id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("student_teachers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/students/${student_id}`);
}

export async function updateStudent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("student_id") ?? "");

  const name = String(formData.get("name") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim() || null;
  const grade = String(formData.get("grade") ?? "").trim() || null;
  const contact = String(formData.get("contact") ?? "").trim() || null;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  if (!id || !name) throw new Error("학생 이름을 입력해주세요.");

  const { error } = await supabase
    .from("students")
    .update({ name, school, grade, contact, memo })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin/students");
}
