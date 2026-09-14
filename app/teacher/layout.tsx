import Link from "next/link";
import { requireTeacher } from "@/lib/current-user";
import { signOut } from "@/app/login/actions";

const NAV = [
  { href: "/teacher", label: "내 학생" },
  { href: "/teacher/class-logs", label: "수업일지" },
  { href: "/teacher/counseling-logs", label: "상담일지" },
];

export default async function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  const { profile } = await requireTeacher();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
              GoldenGate Consulting
            </p>
            <p className="text-sm font-bold text-slate-900">{profile.full_name} 선생님</p>
          </div>
          <div className="flex items-center gap-2">
            {profile.role === "admin" && (
              <Link href="/admin" className="btn-secondary">
                관리자로
              </Link>
            )}
            <form action={signOut}>
              <button type="submit" className="btn-secondary">
                로그아웃
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
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
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
