"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createFirstAdmin(formData: FormData) {
  const adminClient = createAdminClient();

  // 동시에 두 번 제출되는 경우 등을 대비해 제출 시점에도 한 번 더 확인
  // (관리자 계정이 이미 하나라도 있으면 이 폼으로는 더 만들 수 없음).
  const { count, error: countError } = await adminClient
    .from("profiles")
    .select("*", { count: "exact", head: true });
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    redirect("/login?error=" + encodeURIComponent("이미 계정이 설정되어 있습니다. 로그인해주세요."));
  }

  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!full_name || !email || password.length < 8) {
    throw new Error("이름, 이메일을 입력하고 비밀번호는 8자 이상으로 설정해주세요.");
  }

  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: "admin" },
  });
  if (error) throw new Error(error.message);

  redirect("/login?created=1");
}
