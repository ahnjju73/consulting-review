import Link from "next/link";
import { requireAdmin } from "@/lib/current-user";
import {
  getAllClassLogsForAdmin,
  getAllCounselingLogsForAdmin,
  getAllStudents,
  getAllTeachers,
} from "@/lib/queries";

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();
  const [teachers, students, classLogs, counselingLogs] = await Promise.all([
    getAllTeachers(supabase),
    getAllStudents(supabase),
    getAllClassLogsForAdmin(supabase),
    getAllCounselingLogsForAdmin(supabase),
  ]);

  const recentLogs = [
    ...classLogs.slice(0, 5).map((l) => ({
      kind: "수업" as const,
      date: l.session_date,
      student: l.student_name,
      teacher: l.teacher_name,
      summary: l.content,
    })),
    ...counselingLogs.slice(0, 5).map((l) => ({
      kind: "상담" as const,
      date: l.session_datetime.slice(0, 10),
      student: l.student_name,
      teacher: l.teacher_name,
      summary: l.topic,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  const stats = [
    { label: "선생님", value: teachers.length, href: "/admin/teachers" },
    { label: "학생", value: students.length, href: "/admin/students" },
    { label: "수업일지", value: classLogs.length, href: "/admin/logs" },
    { label: "상담일지", value: counselingLogs.length, href: "/admin/logs" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:border-slate-300">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">최근 일지</h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-400">아직 작성된 일지가 없습니다.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {recentLogs.map((log, i) => (
              <li key={i} className="flex items-start gap-3 py-2.5 text-sm">
                <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                  {log.kind}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-slate-800">
                    <span className="font-semibold">{log.student}</span>
                    <span className="text-slate-400"> · {log.teacher} 선생님</span>
                  </p>
                  <p className="truncate text-slate-500">{log.summary}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{log.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
