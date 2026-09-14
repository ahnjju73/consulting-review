"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/current-user";
import { ATTENDANCE_OPTIONS } from "@/lib/types";

function parseAssignment(value: string) {
  const [student_id, subject] = value.split("|||");
  return { student_id, subject };
}

export async function createClassLog(formData: FormData) {
  const { supabase, profile } = await requireTeacher();

  const { student_id, subject } = parseAssignment(String(formData.get("assignment") ?? ""));
  const session_date = String(formData.get("session_date") ?? "");
  const session_no = String(formData.get("session_no") ?? "").trim() || null;
  const attendance = String(formData.get("attendance") ?? "출석");
  const content = String(formData.get("content") ?? "").trim();
  const homework_check = String(formData.get("homework_check") ?? "").trim() || null;
  const understanding = String(formData.get("understanding") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const next_plan = String(formData.get("next_plan") ?? "").trim() || null;

  if (!student_id || !subject || !session_date || !content) {
    throw new Error("학생, 날짜, 수업 내용은 필수입니다.");
  }
  if (!(ATTENDANCE_OPTIONS as readonly string[]).includes(attendance)) {
    throw new Error("잘못된 출결 값입니다.");
  }

  const { error } = await supabase.from("class_logs").insert({
    student_id,
    teacher_id: profile.id,
    subject,
    session_date,
    session_no,
    attendance,
    content,
    homework_check,
    understanding,
    notes,
    next_plan,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/teacher/class-logs");
  redirect("/teacher/class-logs");
}

export async function updateClassLog(formData: FormData) {
  const { supabase, profile } = await requireTeacher();

  const id = String(formData.get("id") ?? "");
  const session_date = String(formData.get("session_date") ?? "");
  const session_no = String(formData.get("session_no") ?? "").trim() || null;
  const attendance = String(formData.get("attendance") ?? "출석");
  const content = String(formData.get("content") ?? "").trim();
  const homework_check = String(formData.get("homework_check") ?? "").trim() || null;
  const understanding = String(formData.get("understanding") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const next_plan = String(formData.get("next_plan") ?? "").trim() || null;

  if (!id || !session_date || !content) throw new Error("날짜와 수업 내용은 필수입니다.");

  const { error } = await supabase
    .from("class_logs")
    .update({
      session_date,
      session_no,
      attendance,
      content,
      homework_check,
      understanding,
      notes,
      next_plan,
    })
    .eq("id", id)
    .eq("teacher_id", profile.id); // RLS로도 막히지만 명시적으로 한 번 더 방어

  if (error) throw new Error(error.message);

  revalidatePath("/teacher/class-logs");
  redirect("/teacher/class-logs");
}

export async function deleteClassLog(formData: FormData) {
  const { supabase, profile } = await requireTeacher();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("class_logs").delete().eq("id", id).eq("teacher_id", profile.id);
  if (error) throw new Error(error.message);

  revalidatePath("/teacher/class-logs");
  redirect("/teacher/class-logs");
}
