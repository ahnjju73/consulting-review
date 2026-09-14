import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Component / Server Action에서 쓰는 클라이언트.
// 로그인한 사용자의 쿠키(세션)를 그대로 사용하므로, RLS 정책이 이 클라이언트의
// 모든 쿼리에 그대로 적용됩니다 (관리자면 관리자용 정책, 선생님이면 선생님용 정책).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출된 경우 쿠키를 쓸 수 없음 — middleware가
            // 세션 갱신을 담당하므로 무시해도 안전함.
          }
        },
      },
    }
  );
}
