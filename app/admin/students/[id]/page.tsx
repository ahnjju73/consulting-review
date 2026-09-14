import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/current-user";
import { getAllTeachers, getStudent, getStudentAssignments } from "@/lib/queries";
import { addAssignment, removeAssignment, updateStudent } from "./actions";

export default async function StudentDetailPage({ params }: PageProps<"/admin/students/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [student, assignments, teachers] = await Promise.all([
    getStudent(supabase, id),
    getStudentAssignments(supabase, id),
    getAllTeachers(supabase),
  ]);

  if (!student) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{student.name}</h1>
        <p className="text-sm text-slate-500">학생 정보 · 담당 선생님 배정</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">학생 정보 수정</h2>
        <form action={updateStudent} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="student_id" value={student.id} />
          <div>
            <label className="field-label" htmlFor="name">
              이름 *
            </label>
            <input id="name" name="name" required defaultValue={student.name} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="school">
              학교
            </label>
            <input id="school" name="school" defaultValue={student.school ?? ""} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="grade">
              학년
            </label>
            <input id="grade" name="grade" defaultValue={student.grade ?? ""} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="contact">
              연락처(학부모)
            </label>
            <input id="contact" name="contact" defaultValue={student.contact ?? ""} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="memo">
              메모
            </label>
            <textarea id="memo" name="memo" rows={2} defaultValue={student.memo ?? ""} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-secondary">
              저장
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">담당 선생님 배정</h2>

        {assignments.length === 0 ? (
          <p className="mb-4 text-sm text-slate-400">아직 배정된 선생님이 없습니다.</p>
        ) : (
          <ul className="mb-4 flex flex-col divide-y divide-slate-100">
            {assignments.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2.5">
                <p className="text-sm text-slate-800">
                  <span className="font-semibold">{a.teacher_name}</span>
                  <span className="text-slate-400"> 선생님 · </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                    {a.subject}
                  </span>
                </p>
                <form action={removeAssignment}>
                  <input type="hidden" name="assignment_id" value={a.id} />
                  <input type="hidden" name="student_id" value={student.id} />
                  <button type="submit" className="btn-danger">
                    배정 해제
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {teachers.length === 0 ? (
          <p className="text-sm text-slate-400">
            먼저{" "}
            <a href="/admin/teachers" className="underline">
              선생님 계정
            </a>
            을 만들어주세요.
          </p>
        ) : (
          <form
            action={addAssignment}
            className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <input type="hidden" name="student_id" value={student.id} />
            <div>
              <label className="field-label" htmlFor="teacher_id">
                선생님
              </label>
              <select id="teacher_id" name="teacher_id" required className="field-input">
                <option value="">선택</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="subject">
                과목
              </label>
              <input
                id="subject"
                name="subject"
                required
                className="field-input"
                placeholder="Digital SAT / 에세이 / 상담 등"
              />
            </div>
            <button type="submit" className="btn-primary h-[38px]">
              배정 추가
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
