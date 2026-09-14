import Link from "next/link";
import { requireAdmin } from "@/lib/current-user";
import { signOut } from "@/app/login/actions";

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/teachers", label: "선생님 관리" },
  { href: "/admin/students", label: "학생 관리" },
  { href: "/admin/logs", label: "전체 일지" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
              GoldenGate Consulting
            </p>
            <p className="text-sm font-bold text-slate-900">관리자 · {profile.full_name}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="btn-secondary">
              로그아웃
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
