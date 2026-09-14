# GoldenGate 수업일지 · 상담일지

GoldenGate Consulting의 **관리자 / 선생님 전용** 내부 시스템입니다. 학부모는 이 사이트에
접근하지 않으며, 관리자가 이 안의 기록을 확인한 뒤 별도 방법(카톡 등)으로 학부모에게 공유하는
것을 전제로 만들었습니다. 기존 마케팅 홈페이지(goldengate-nextjs)와는 **완전히 별개의 앱**이며,
DB(Supabase 프로젝트)도 따로 두는 것을 권장합니다 — 학생 개인정보/상담 내용이 공개 마케팅
사이트의 anon key와 섞이지 않도록 하기 위함입니다.

## 역할 구조

- **관리자(admin)**: 선생님 계정 생성, 학생 등록, 학생↔선생님 배정(과목별, 다대다), 전체 일지
  열람.
- **선생님(teacher)**: 로그인 후 본인에게 배정된 학생만 보이고, 그 학생에 대해서만 수업일지 /
  상담일지를 작성·수정·삭제할 수 있음(자기가 쓴 것만).

계정은 **관리자가 직접 생성**합니다(회원가입 폼 없음). 최초 관리자 계정만 아래 절차대로 수동
생성하면, 이후 관리자가 `/admin/teachers`에서 선생님 계정을 계속 만들 수 있습니다.

## 데이터 모델 (`supabase/schema.sql`)

- `profiles` — `auth.users`를 확장, `role`(admin/teacher) 저장. 신규 유저 생성 시 트리거로 자동 생성.
- `students` — 학생 (이름/학교/학년/학부모 연락처/메모).
- `student_teachers` — 학생↔선생님 배정. `(student_id, teacher_id, subject)` 조합, 한 학생에
  과목별로 여러 선생님이 붙을 수 있음 (예: SAT 선생님 + 에세이 선생님 + 상담 컨설턴트).
- `class_logs` — 수업일지: 학생/과목/날짜/회차/출결/진도/과제체크/이해도/특이사항/다음계획.
- `counseling_logs` — 상담일지: 학생/일시/유형/학부모 동석 여부/주제/논의요약/액션아이템/다음
  상담 예정일.
- 모든 테이블 RLS 활성화. 관리자는 전체 접근, 선생님은 `student_teachers`로 배정된 학생 +
  본인이 작성한 로그만 접근 가능하도록 정책이 걸려 있음 (`is_admin()` security definer 함수로
  재귀 없이 관리자 여부 판별).

## 처음 설정하는 법

1. Supabase에서 **새 프로젝트**를 만듭니다(마케팅 사이트와 별도 프로젝트 권장).
2. Supabase 대시보드 → SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다. (재실행해도
   안전하게 작성되어 있음)
3. `.env.local.example`을 `.env.local`로 복사하고, Supabase 프로젝트의 API 설정 값(Project URL,
   anon key, **service_role key**)을 채워 넣습니다.
   - `SUPABASE_SERVICE_ROLE_KEY`는 절대 `NEXT_PUBLIC_`로 시작하지 않아야 하며, 선생님 계정을
     생성하는 서버 액션(`app/admin/teachers/actions.ts`)에서만 사용됩니다. 브라우저에 노출되지
     않습니다.
4. `npm install`
5. **최초 관리자 계정 만들기** (1회만): 배포된 사이트(또는 `npm run dev` 후 로컬)에서
   `/setup-admin`에 접속해서 이름/이메일/비밀번호를 입력하면 바로 관리자 계정이 만들어집니다.
   Supabase 대시보드나 SQL을 직접 만질 필요가 없습니다.
   - 이 화면은 **profiles 테이블이 완전히 비어있을 때만** 동작하고, 계정이 하나라도 생기면
     자동으로 잠깁니다(그 이후엔 "이미 설정되어 있습니다" 메시지만 뜨고 더 이상 계정을 만들 수
     없음) — 그러니 배포 직후, 아직 아무에게도 URL을 공유하기 전에 가장 먼저 해주세요.
   - (참고) 직접 SQL로 하고 싶다면: Supabase 대시보드 → Authentication → Users → "Add user"로
     계정을 만든 뒤, SQL Editor에서 `update profiles set role = 'admin' where id = '유저 UUID';`
     를 실행해도 동일하게 됩니다. 트리거가 `profiles` 행을 기본 `role='teacher'`로 만들어두기
     때문입니다. 하지만 위 `/setup-admin` 방법이 훨씬 간단합니다.
6. 이 관리자 계정으로 `/login`에서 로그인 → `/admin/teachers`에서 실제 선생님 계정들을
   만들면 됩니다.

## 배포 (Vercel 등)

- 위 세 개 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`)를 배포 환경에도 동일하게 설정해야 합니다.
- `proxy.ts`(Next.js 16의 미들웨어 명칭 변경분)가 모든 요청에서 Supabase 세션을 갱신하고
  로그인 여부를 확인합니다 — 별도 설정 불필요.

## 알려진 제한 / 다음에 고려할 것

- 선생님 비밀번호 찾기(재설정) 플로우 없음 — 현재는 관리자가 계정 생성 시 정한 임시
  비밀번호를 직접 전달하는 방식. 필요하면 Supabase의 `resetPasswordForEmail` 붙이면 됨(이메일
  발송 설정 필요).
- 관리자는 전체 일지를 **열람만** 가능(수정/삭제는 작성한 선생님만) — 관리자 수정 권한이
  필요하면 요청해주세요.
- 일지 검색은 `/admin/logs`에서 학생/선생님 이름·과목 텍스트 검색만 지원. 기간별 필터, CSV
  내보내기 등은 필요하면 추가 가능.
- 학생 삭제 시 연결된 배정/일지도 함께 삭제됨(`on delete cascade`) — 실수 방지가 필요하면
  삭제 확인 절차를 추가하는 게 좋습니다.
