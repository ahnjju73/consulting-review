import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/current-user";
import { getClassLogById, getStudent } from "@/lib/queries";
import { ATTENDANCE_OPTIONS } from "@/lib/types";
import { deleteClassLog, updateClassLog } from "../actions";

export default async function EditClassLogPage({ params }: PageProps<"/teacher/class-logs/[id]">) {
  const { id } = await params;
  const { supabase, profile } = await requireTeacher();

  const log = await getClassLogById(supabase, id);
  if (!log || log.teacher_id !== profile.id) notFound();

  const student = await getStudent(supabase, log.student_id);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{student?.name ?? "학생"} 수업일지 수정</h1>
        <p className="text-sm text-slate-500">{log.subject}</p>
      </div>

      <form action={updateClassLog} className="card flex flex-col gap-4">
        <input type="hidden" name="id" value={log.id} />

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
              defaultValue={log.session_date}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="session_no">
              회차
            </label>
            <input
              id="session_no"
              name="session_no"
              defaultValue={log.session_no ?? ""}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="attendance">
              출결 *
            </label>
            <select
              id="attendance"
              name="attendance"
              required
              defaultValue={log.attendance}
              className="field-input"
            >
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
          <textarea id="content" name="content" required rows={4} defaultValue={log.content} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="homework_check">
            과제 체크
          </label>
          <textarea
            id="homework_check"
            name="homework_check"
            rows={2}
            defaultValue={log.homework_check ?? ""}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="understanding">
            이해도 / 참여도
          </label>
          <input
            id="understanding"
            name="understanding"
            defaultValue={log.understanding ?? ""}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="notes">
            특이사항
          </label>
          <textarea id="notes" name="notes" rows={2} defaultValue={log.notes ?? ""} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="next_plan">
            다음 수업 계획 / 과제
          </label>
          <textarea
            id="next_plan"
            name="next_plan"
            rows={2}
            defaultValue={log.next_plan ?? ""}
            className="field-input"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              저장
            </button>
            <Link href="/teacher/class-logs" className="btn-secondary">
              목록으로
            </Link>
          </div>
        </div>
      </form>

      <form action={deleteClassLog}>
        <input type="hidden" name="id" value={log.id} />
        <button type="submit" className="btn-danger">
          이 수업일지 삭제
        </button>
      </form>
    </div>
  );
}
