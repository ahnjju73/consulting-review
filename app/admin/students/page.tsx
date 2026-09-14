import Link from "next/link";
import { requireAdmin } from "@/lib/current-user";
import { getAllStudents } from "@/lib/queries";
import { createStudent } from "./actions";

export default async function StudentsPage() {
  const { supabase } = await requireAdmin();
  const students = await getAllStudents(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">학생 관리</h1>
        <p className="text-sm text-slate-500">
          학생을 등록한 뒤, 학생 상세 페이지에서 담당 선생님을 과목별로 배정하세요.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">새 학생 등록</h2>
        <form action={createStudent} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="name">
              이름 *
            </label>
            <input id="name" name="name" required className="field-input" placeholder="홍길동" />
          </div>
          <div>
            <label className="field-label" htmlFor="school">
              학교
            </label>
            <input id="school" name="school" className="field-input" placeholder="○○고등학교" />
          </div>
          <div>
            <label className="field-label" htmlFor="grade">
              학년
            </label>
            <input id="grade" name="grade" className="field-input" placeholder="11학년" />
          </div>
          <div>
            <label className="field-label" htmlFor="contact">
              연락처(학부모)
            </label>
            <input id="contact" name="contact" className="field-input" placeholder="010-0000-0000" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="memo">
              메모
            </label>
            <textarea id="memo" name="memo" rows={2} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              학생 등록
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">전체 학생 ({students.length}명)</h2>
        {students.length === 0 ? (
          <p className="text-sm text-slate-400">아직 등록된 학생이 없습니다.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {students.map((s) => (
              <li key={s.id} className="py-2.5">
                <Link href={`/admin/students/${s.id}`} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">
                      {[s.school, s.grade].filter(Boolean).join(" · ") || "학교/학년 미입력"}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">배정 관리 →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
