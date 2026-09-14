import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/current-user";
import { getCounselingLogById, getStudent } from "@/lib/queries";
import { COUNSELING_TYPE_OPTIONS } from "@/lib/types";
import { deleteCounselingLog, updateCounselingLog } from "../actions";

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default async function EditCounselingLogPage({
  params,
}: PageProps<"/teacher/counseling-logs/[id]">) {
  const { id } = await params;
  const { supabase, profile } = await requireTeacher();

  const log = await getCounselingLogById(supabase, id);
  if (!log || log.teacher_id !== profile.id) notFound();

  const student = await getStudent(supabase, log.student_id);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{student?.name ?? "학생"} 상담일지 수정</h1>
      </div>

      <form action={updateCounselingLog} className="card flex flex-col gap-4">
        <input type="hidden" name="id" value={log.id} />

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
              defaultValue={toLocalDatetimeValue(log.session_datetime)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="type">
              상담 유형 *
            </label>
            <select id="type" name="type" required defaultValue={log.type} className="field-input">
              {COUNSELING_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="parent_present"
            defaultChecked={log.parent_present}
            className="h-4 w-4 rounded border-slate-300"
          />
          학부모 동석
        </label>

        <div>
          <label className="field-label" htmlFor="topic">
            상담 주제 / 목적 *
          </label>
          <input id="topic" name="topic" required defaultValue={log.topic} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="summary">
            논의 내용 요약 *
          </label>
          <textarea
            id="summary"
            name="summary"
            required
            rows={4}
            defaultValue={log.summary}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="action_items">
            액션 아이템
          </label>
          <textarea
            id="action_items"
            name="action_items"
            rows={2}
            defaultValue={log.action_items ?? ""}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="next_session_date">
            다음 상담 예정일
          </label>
          <input
            id="next_session_date"
            name="next_session_date"
            type="date"
            defaultValue={log.next_session_date ?? ""}
            className="field-input"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            저장
          </button>
          <Link href="/teacher/counseling-logs" className="btn-secondary">
            목록으로
          </Link>
        </div>
      </form>

      <form action={deleteCounselingLog}>
        <input type="hidden" name="id" value={log.id} />
        <button type="submit" className="btn-danger">
          이 상담일지 삭제
        </button>
      </form>
    </div>
  );
}
