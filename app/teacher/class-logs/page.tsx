import Link from "next/link";
import { requireTeacher } from "@/lib/current-user";
import { getMyClassLogs } from "@/lib/queries";

export default async function ClassLogsPage() {
  const { supabase, profile } = await requireTeacher();
  const logs = await getMyClassLogs(supabase, profile.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">수업일지</h1>
          <p className="text-sm text-slate-500">내가 작성한 수업일지 {logs.length}건</p>
        </div>
        <Link href="/teacher/class-logs/new" className="btn-primary shrink-0">
          + 새 수업일지
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="card text-sm text-slate-400">아직 작성한 수업일지가 없습니다.</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {logs.map((l) => (
            <li key={l.id}>
              <Link href={`/teacher/class-logs/${l.id}`} className="card block hover:border-slate-300">
                <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-slate-800">{l.student_name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                    {l.subject}
                  </span>
                  <span
                    className={
                      "rounded px-1.5 py-0.5 text-xs font-medium " +
                      (l.attendance === "출석"
                        ? "bg-emerald-50 text-emerald-700"
                        : l.attendance === "결석"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700")
                    }
                  >
                    {l.attendance}
                  </span>
                  <span className="text-xs text-slate-400">{l.session_date}</span>
                </div>
                <p className="truncate text-sm text-slate-600">{l.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
