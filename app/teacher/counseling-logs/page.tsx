import Link from "next/link";
import { requireTeacher } from "@/lib/current-user";
import { getMyCounselingLogs } from "@/lib/queries";

export default async function CounselingLogsPage() {
  const { supabase, profile } = await requireTeacher();
  const logs = await getMyCounselingLogs(supabase, profile.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">상담일지</h1>
          <p className="text-sm text-slate-500">내가 작성한 상담일지 {logs.length}건</p>
        </div>
        <Link href="/teacher/counseling-logs/new" className="btn-primary shrink-0">
          + 새 상담일지
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="card text-sm text-slate-400">아직 작성한 상담일지가 없습니다.</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {logs.map((l) => (
            <li key={l.id}>
              <Link
                href={`/teacher/counseling-logs/${l.id}`}
                className="card block hover:border-slate-300"
              >
                <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-slate-800">{l.student_name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                    {l.type}
                  </span>
                  {l.parent_present && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                      학부모 동석
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(l.session_datetime).toLocaleString("ko-KR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="truncate text-sm font-medium text-slate-700">{l.topic}</p>
                <p className="truncate text-sm text-slate-500">{l.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
