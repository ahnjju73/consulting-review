"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/current-user";
import { COUNSELING_TYPE_OPTIONS } from "@/lib/types";

export async function createCounselingLog(formData: FormData) {
  const { supabase, profile } = await requireTeacher();

  const student_id = String(formData.get("student_id") ?? "");
  const session_datetime = String(formData.get("session_datetime") ?? "");
  const type = String(formData.get("type") ?? "");
  const parent_present = formData.get("parent_present") === "on";
  const topic = String(formData.get("topic") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const action_items = String(formData.get("action_items") ?? "").trim() || null;
  const next_session_date = String(formData.get("next_session_date") ?? "").trim() || null;

  if (!student_id || !session_datetime || !topic || !summary) {
    throw new Error("학생, 상담일시, 주제, 논의 요약은 필수입니다.");
  }
  if (!(COUNSELING_TYPE_OPTIONS as readonly string[]).includes(type)) {
    throw new Error("잘못된 상담 유형입니다.");
  }

  const { error } = await supabase.from("counseling_logs").insert({
    student_id,
    teacher_id: profile.id,
    session_datetime: new Date(session_datetime).toISOString(),
    type,
    parent_present,
    topic,
    summary,
    action_items,
    next_session_date,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/teacher/counseling-logs");
  redirect("/teacher/counseling-logs");
}

export async function updateCounselingLog(formData: FormData) {
  const { supabase, profile } = await requireTeacher();

  const id = String(formData.get("id") ?? "");
  const session_datetime = String(formData.get("session_datetime") ?? "");
  const type = String(formData.get("type") ?? "");
  const parent_present = formData.get("parent_present") === "on";
  const topic = String(formData.get("topic") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const action_items = String(formData.get("action_items") ?? "").trim() || null;
  const next_session_date = String(formData.get("next_session_date") ?? "").trim() || null;

  if (!id || !session_datetime || !topic || !summary) {
    throw new Error("상담일시, 주제, 논의 요약은 필수입니다.");
  }

  const { error } = await supabase
    .from("counseling_logs")
    .update({
      session_datetime: new Date(session_datetime).toISOString(),
      type,
      parent_present,
      topic,
      summary,
      action_items,
      next_session_date,
    })
    .eq("id", id)
    .eq("teacher_id", profile.id);

  if (error) throw new Error(error.message);

  revalidatePath("/teacher/counseling-logs");
  redirect("/teacher/counseling-logs");
}

export async function deleteCounselingLog(formData: FormData) {
  const { supabase, profile } = await requireTeacher();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase
    .from("counseling_logs")
    .delete()
    .eq("id", id)
    .eq("teacher_id", profile.id);
  if (error) throw new Error(error.message);

  revalidatePath("/teacher/counseling-logs");
  redirect("/teacher/counseling-logs");
}
