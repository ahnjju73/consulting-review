import { requireAdmin } from "@/lib/current-user";
import { getAllClassLogsForAdmin, getAllCounselingLogsForAdmin } from "@/lib/queries";

export default async function AdminLogsPage({ searchParams }: PageProps<"/admin/logs">) {
  const params = await searchParams;
  const q = (typeof params.q === "string" ? params.q : "").trim().toLowerCase();

  const { supabase } = await requireAdmin();
  const [classLogs, counselingLogs] = await Promise.all([
    getAllClassLogsForAdmin(supabase),
    getAllCounselingLogsForAdmin(supabase),
  ]);

  const matches = (text: string) => !q || text.toLowerCase().includes(q);

  const filteredClassLogs = classLogs.filter(
    (l) => matches(l.student_name) || matches(l.teacher_name) || matches(l.subject)
  );
  const filteredCounselingLogs = counselingLogs.filter(
    (l) => matches(l.student_name) || matches(l.teacher_name) || matches(l.topic)
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">전체 일지</h1>
        <p className="text-sm text-slate-500">모든 선생님이 작성한 수업일지·상담일지를 확인할 수 있습니다.</p>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="학생 이름, 선생님 이름, 과목으로 검색"
          className="field-input"
        />
        <button type="submit" className="btn-secondary shrink-0">
          검색
        </button>
      </form>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">
          수업일지 ({filteredClassLogs.length}건)
        </h2>
        {filteredClassLogs.length === 0 ? (
          <p className="text-sm text-slate-400">해당하는 수업일지가 없습니다.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {filteredClassLogs.map((l) => (
              <li key={l.id} className="py-3 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
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
                  <span className="text-xs text-slate-400">
                    {l.session_date} · {l.teacher_name} 선생님
                    {l.session_no ? ` · ${l.session_no}회차` : ""}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-slate-700">{l.content}</p>
                {l.notes && <p className="mt-1 text-slate-500">특이사항: {l.notes}</p>}
                {l.next_plan && <p className="mt-1 text-slate-500">다음 계획: {l.next_plan}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">
          상담일지 ({filteredCounselingLogs.length}건)
        </h2>
        {filteredCounselingLogs.length === 0 ? (
          <p className="text-sm text-slate-400">해당하는 상담일지가 없습니다.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {filteredCounselingLogs.map((l) => (
              <li key={l.id} className="py-3 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
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
                    })}{" "}
                    · {l.teacher_name} 선생님
                  </span>
                </div>
                <p className="font-medium text-slate-700">{l.topic}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-600">{l.summary}</p>
                {l.action_items && <p className="mt-1 text-slate-500">액션아이템: {l.action_items}</p>}
                {l.next_session_date && (
                  <p className="mt-1 text-slate-500">다음 상담 예정: {l.next_session_date}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
