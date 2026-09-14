import Link from "next/link";
import { requireTeacher } from "@/lib/current-user";
import { getMyStudents } from "@/lib/queries";

export default async function TeacherDashboard() {
  const { supabase, profile } = await requireTeacher();
  const students = await getMyStudents(supabase, profile.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">내 담당 학생</h1>
        <p className="text-sm text-slate-500">관리자가 배정한 학생만 표시됩니다.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link href="/teacher/class-logs/new" className="btn-primary justify-center">
          + 수업일지 작성
        </Link>
        <Link href="/teacher/counseling-logs/new" className="btn-secondary justify-center">
          + 상담일지 작성
        </Link>
      </div>

      <div className="card">
        {students.length === 0 ? (
          <p className="text-sm text-slate-400">
            아직 배정된 학생이 없습니다. 관리자에게 학생 배정을 요청해주세요.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {students.map((s) => (
              <li key={s.student_id} className="py-2.5">
                <p className="text-sm font-semibold text-slate-800">{s.student_name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.subjects.map((subj) => (
                    <span
                      key={subj}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
