import Link from "next/link";
import { requireTeacher } from "@/lib/current-user";
import { getMyAssignmentOptions } from "@/lib/queries";
import { ATTENDANCE_OPTIONS } from "@/lib/types";
import { createClassLog } from "../actions";

export default async function NewClassLogPage() {
  const { supabase, profile } = await requireTeacher();
  const options = await getMyAssignmentOptions(supabase, profile.id);

  if (options.length === 0) {
    return (
      <div className="card text-sm text-slate-500">
        아직 배정된 학생이 없어 수업일지를 작성할 수 없습니다. 관리자에게 학생 배정을 요청해주세요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-slate-900">새 수업일지</h1>

      <form action={createClassLog} className="card flex flex-col gap-4">
        <div>
          <label className="field-label" htmlFor="assignment">
            학생 / 과목 *
          </label>
          <select id="assignment" name="assignment" required className="field-input">
            <option value="">선택</option>
            {options.map((o) => (
              <option key={`${o.student_id}|||${o.subject}`} value={`${o.student_id}|||${o.subject}`}>
                {o.student_name} — {o.subject}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="session_date">
              수업 날짜 *
            </label>
            <input
              id="session_date"
              name="session_date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="session_no">
              회차
            </label>
            <input id="session_no" name="session_no" className="field-input" placeholder="예: 3/20" />
          </div>
          <div>
            <label className="field-label" htmlFor="attendance">
              출결 *
            </label>
            <select id="attendance" name="attendance" required defaultValue="출석" className="field-input">
              {ATTENDANCE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="content">
            오늘 진도 / 다룬 내용 *
          </label>
          <textarea id="content" name="content" required rows={4} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="homework_check">
            과제 체크 (지난 과제 완료도)
          </label>
          <textarea id="homework_check" name="homework_check" rows={2} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="understanding">
            이해도 / 참여도
          </label>
          <input id="understanding" name="understanding" className="field-input" placeholder="예: 상 / 중 / 하" />
        </div>

        <div>
          <label className="field-label" htmlFor="notes">
            특이사항
          </label>
          <textarea id="notes" name="notes" rows={2} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="next_plan">
            다음 수업 계획 / 과제
          </label>
          <textarea id="next_plan" name="next_plan" rows={2} className="field-input" />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            저장
          </button>
          <Link href="/teacher/class-logs" className="btn-secondary">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
