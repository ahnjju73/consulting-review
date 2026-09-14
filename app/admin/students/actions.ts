"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/current-user";

export async function createStudent(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim() || null;
  const grade = String(formData.get("grade") ?? "").trim() || null;
  const contact = String(formData.get("contact") ?? "").trim() || null;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  if (!name) throw new Error("학생 이름을 입력해주세요.");

  const { error } = await supabase.from("students").insert({ name, school, grade, contact, memo });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/students");
}

export async function deleteStudent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const studentId = String(formData.get("student_id") ?? "");
  if (!studentId) return;

  const { error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/students");
}
