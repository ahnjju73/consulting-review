import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createFirstAdmin } from "./actions";

// 이 페이지는 매번 profiles 테이블을 직접 확인해야 하므로 빌드 시점에 정적으로
// 미리 렌더링하면 안 됨 (또한 환경변수가 빌드 환경에 없을 수도 있음).
export const dynamic = "force-dynamic";

export default async function SetupAdminPage() {
  const adminClient = createAdminClient();
  const { count, error } = await adminClient
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="card w-full max-w-sm text-center">
          <p className="text-sm text-red-700">
            Supabase 연결을 확인하지 못했습니다. 환경변수(NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY)와 schema.sql 실행 여부를 확인해주세요.
          </p>
          <p className="mt-2 text-xs text-slate-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const alreadySetUp = (count ?? 0) > 0;

  if (alreadySetUp) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="card w-full max-w-sm text-center">
          <p className="text-sm text-slate-600">
            이미 관리자 계정이 설정되어 있습니다. 이 화면으로는 계정을 추가로 만들 수 없어요.
          </p>
          <Link href="/login" className="btn-primary mt-4 w-full">
            로그인 화면으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            GoldenGate Consulting
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">최초 관리자 계정 만들기</h1>
          <p className="mt-2 text-sm text-slate-500">
            아직 계정이 하나도 없어서, 이 화면에서 딱 한 번만 관리자 계정을 바로 만들 수 있어요.
            (계정이 하나라도 생기면 이 화면은 자동으로 잠깁니다.)
          </p>
        </div>

        <form action={createFirstAdmin} className="card flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor="full_name">
              이름
            </label>
            <input id="full_name" name="full_name" required className="field-input" placeholder="주홍" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="field-input"
              placeholder="you@goldengate.co.kr"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="field-input"
              placeholder="8자 이상"
            />
          </div>
          <button type="submit" className="btn-primary mt-2 w-full">
            관리자 계정 생성
          </button>
        </form>
      </div>
    </div>
  );
}
