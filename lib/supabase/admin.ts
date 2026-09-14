import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// service_role 키를 쓰는 서버 전용 클라이언트. RLS를 완전히 우회하므로
// 절대 클라이언트 컴포넌트나 API 응답에 노출되면 안 되고, 오직 서버
// 액션(관리자 전용 로직) 안에서만 import 해서 사용합니다.
// 이 파일을 client component에서 import하면 안 됩니다.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
