import { signIn } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const created = params.created === "1";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            GoldenGate Consulting
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">수업일지 · 상담일지</h1>
        </div>

        <form action={signIn} className="card flex flex-col gap-4">
          {created && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 border border-emerald-200">
              계정이 생성되었습니다. 로그인해주세요.
            </p>
          )}
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
              {error}
            </p>
          )}
          <div>
            <label className="field-label" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
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
              autoComplete="current-password"
              className="field-input"
            />
          </div>
          <button type="submit" className="btn-primary mt-2 w-full">
            로그인
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          계정이 없으신가요? 관리자에게 문의해 계정을 발급받으세요.
        </p>
        <p className="mt-1 text-center text-xs text-slate-300">
          처음 설정하시나요?{" "}
          <a href="/setup-admin" className="underline">
            관리자 계정 만들기
          </a>
        </p>
      </div>
    </div>
  );
}
