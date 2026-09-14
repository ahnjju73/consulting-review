import Link from "next/link";
import { requireTeacher } from "@/lib/current-user";
import { getMyStudents } from "@/lib/queries";
import { COUNSELING_TYPE_OPTIONS } from "@/lib/types";
import { createCounselingLog } from "../actions";

function nowLocalDatetime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default async function NewCounselingLogPage() {
  const { supabase, profile } = await requireTeacher();
  const students = await getMyStudents(supabase, profile.id);

  if (students.length === 0) {
    return (
      <div className="card text-sm text-slate-500">
        아직 배정된 학생이 없어 상담일지를 작성할 수 없습니다. 관리자에게 학생 배정을 요청해주세요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-slate-900">새 상담일지</h1>

      <form action={createCounselingLog} className="card flex flex-col gap-4">
        <div>
          <label className="field-label" htmlFor="student_id">
            학생 *
          </label>
          <select id="student_id" name="student_id" required className="field-input">
            <option value="">선택</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="session_datetime">
              상담 일시 *
            </label>
            <input
              id="session_datetime"
              name="session_datetime"
              type="datetime-local"
              required
              defaultValue={nowLocalDatetime()}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="type">
              상담 유형 *
            </label>
            <select id="type" name="type" required defaultValue="정기 전략 미팅" className="field-input">
              {COUNSELING_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="parent_present" className="h-4 w-4 rounded border-slate-300" />
          학부모 동석
        </label>

        <div>
          <label className="field-label" htmlFor="topic">
            상담 주제 / 목적 *
          </label>
          <input
            id="topic"
            name="topic"
            required
            className="field-input"
            placeholder="예: 지원 대학 리스트 확정"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="summary">
            논의 내용 요약 *
          </label>
          <textarea id="summary" name="summary" required rows={4} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="action_items">
            액션 아이템 (학생/학부모가 할 일)
          </label>
          <textarea id="action_items" name="action_items" rows={2} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="next_session_date">
            다음 상담 예정일
          </label>
          <input id="next_session_date" name="next_session_date" type="date" className="field-input" />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            저장
          </button>
          <Link href="/teacher/counseling-logs" className="btn-secondary">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
