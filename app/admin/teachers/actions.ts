"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/current-user";

export async function createTeacher(formData: FormData) {
  await requireAdmin(); // 관리자만 호출 가능하도록 재확인

  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!full_name || !email || password.length < 8) {
    throw new Error("이름, 이메일을 입력하고 비밀번호는 8자 이상으로 설정해주세요.");
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 이메일 발송/확인 없이 바로 로그인 가능하도록
    user_metadata: { full_name, role: "teacher" },
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/teachers");
}

export async function deleteTeacher(formData: FormData) {
  await requireAdmin();
  const teacherId = String(formData.get("teacher_id") ?? "");
  if (!teacherId) return;

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(teacherId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/teachers");
}
