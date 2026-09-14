import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// 로그인 여부 + profiles 행을 함께 확인. 세션이 없거나 profiles 행이 없으면
// (이상 상태) 로그인 페이지로 보냅니다.
export async function requireUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: Profile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return { supabase, profile: profile as Profile };
}

export async function requireAdmin() {
  const { supabase, profile } = await requireUser();
  if (profile.role !== "admin") redirect("/teacher");
  return { supabase, profile };
}

export async function requireTeacher() {
  const { supabase, profile } = await requireUser();
  // 관리자도 필요하면 선생님 화면을 볼 수 있게 허용 (막지 않음).
  if (profile.role !== "teacher" && profile.role !== "admin") redirect("/login");
  return { supabase, profile };
}
