import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 모든 요청마다 Supabase 세션 쿠키를 갱신하고, 로그인 여부/역할에 따라
// 접근 가능한 경로로 리다이렉트합니다.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPath = path.startsWith("/login");
  const isProtectedPath = path.startsWith("/admin") || path.startsWith("/teacher");

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    // 로그인된 상태로 /login에 접근하면 역할에 맞는 홈으로 보냄.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "admin" ? "/admin" : "/teacher";
    return NextResponse.redirect(url);
  }

  // 관리자 전용 경로에 선생님이 접근하는 경우 등, 역할 불일치는 각 layout에서
  // 한 번 더 확인합니다 (여기서는 로그인 여부만 판단).
  return supabaseResponse;
}
