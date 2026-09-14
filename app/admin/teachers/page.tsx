import { requireAdmin } from "@/lib/current-user";
import { getAllTeachers } from "@/lib/queries";
import { createTeacher, deleteTeacher } from "./actions";

export default async function TeachersPage() {
  const { supabase } = await requireAdmin();
  const teachers = await getAllTeachers(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">선생님 관리</h1>
        <p className="text-sm text-slate-500">
          여기서 만든 계정으로 선생님이 로그인해서 담당 학생의 수업일지·상담일지를 작성합니다.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">새 선생님 계정 만들기</h2>
        <form action={createTeacher} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_1fr_auto] sm:items-end">
          <div>
            <label className="field-label" htmlFor="full_name">
              이름
            </label>
            <input id="full_name" name="full_name" required className="field-input" placeholder="김선생" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="field-input"
              placeholder="teacher@goldengate.co.kr"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              임시 비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="text"
              required
              minLength={8}
              className="field-input"
              placeholder="8자 이상"
            />
          </div>
          <button type="submit" className="btn-primary h-[38px]">
            계정 생성
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-400">
          생성 후 이 이메일/비밀번호를 선생님께 직접 전달해주세요. 선생님은 로그인 후 비밀번호를 바꿀 수 있습니다.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">전체 선생님 ({teachers.length}명)</h2>
        {teachers.length === 0 ? (
          <p className="text-sm text-slate-400">아직 등록된 선생님이 없습니다.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {teachers.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.full_name}</p>
                  <p className="text-xs text-slate-400">
                    가입일 {new Date(t.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <form action={deleteTeacher}>
                  <input type="hidden" name="teacher_id" value={t.id} />
                  <button type="submit" className="btn-danger">
                    계정 삭제
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
