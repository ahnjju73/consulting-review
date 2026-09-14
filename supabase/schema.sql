-- ============================================================================
-- GoldenGate Consulting — 수업일지 / 상담일지 시스템 DB 스키마
-- Supabase(Postgres) SQL Editor에서 그대로 실행하면 됩니다. 재실행해도 안전하도록
-- 대부분 `if not exists` / `create or replace`로 작성했습니다.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. 확장 (uuid 생성용 — Supabase 프로젝트는 기본 활성화되어 있는 경우가 많음)
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. profiles — auth.users를 확장해 이름/역할(admin | teacher)을 저장
--    auth.users 행이 생성되면 트리거로 자동 생성됩니다 (아래 참고).
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'teacher' check (role in ('admin', 'teacher')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. is_admin() — RLS 정책에서 재귀 없이 "나는 관리자인가"를 확인하기 위한
--    security definer 함수. profiles 테이블 소유자(postgres) 권한으로 실행되어
--    profiles의 RLS를 우회하므로 정책 안에서 안전하게 쓸 수 있습니다.
-- ----------------------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. students — 학생 (관리자가 등록)
-- ----------------------------------------------------------------------------
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school text,
  grade text,
  contact text,
  memo text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. student_teachers — 학생 ↔ 선생님 배정 (다대다, 과목별로 여러 건 가능)
--    예: (학생 A, 선생님 김, "Digital SAT"), (학생 A, 선생님 이, "에세이")
-- ----------------------------------------------------------------------------
create table if not exists student_teachers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  subject text not null,
  created_at timestamptz not null default now(),
  unique (student_id, teacher_id, subject)
);

-- ----------------------------------------------------------------------------
-- 5. class_logs — 수업일지
-- ----------------------------------------------------------------------------
create table if not exists class_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  subject text not null,
  session_date date not null,
  session_no text,
  attendance text not null default '출석' check (attendance in ('출석', '지각', '결석', '보강')),
  content text not null,
  homework_check text,
  understanding text,
  notes text,
  next_plan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. counseling_logs — 상담일지
-- ----------------------------------------------------------------------------
create table if not exists counseling_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  session_datetime timestamptz not null,
  type text not null default '정기 상담' check (
    type in ('신규 상담', '정기 전략 미팅', '원서/성적 리뷰', '기타')
  ),
  parent_present boolean not null default false,
  topic text not null,
  summary text not null,
  action_items text,
  next_session_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. updated_at 자동 갱신 트리거
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists class_logs_set_updated_at on class_logs;
create trigger class_logs_set_updated_at
  before update on class_logs
  for each row execute function set_updated_at();

drop trigger if exists counseling_logs_set_updated_at on counseling_logs;
create trigger counseling_logs_set_updated_at
  before update on counseling_logs
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- 8. auth.users 생성 시 profiles 행 자동 생성
--    관리자가 선생님 계정을 만들 때 supabase.auth.admin.createUser()의
--    user_metadata에 { full_name, role }을 넣어 호출하면 이 트리거가
--    profiles 행을 함께 만들어줍니다.
-- ----------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'teacher')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- 9. RLS 활성화 + 정책
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;
alter table students enable row level security;
alter table student_teachers enable row level security;
alter table class_logs enable row level security;
alter table counseling_logs enable row level security;

-- profiles: 본인 행은 조회 가능, 관리자는 전체 조회/수정 가능
drop policy if exists "profiles_self_select" on profiles;
create policy "profiles_self_select" on profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_admin_all" on profiles;
create policy "profiles_admin_all" on profiles
  for all using (is_admin()) with check (is_admin());

-- students: 관리자는 전체 CRUD, 선생님은 본인에게 배정된 학생만 조회
drop policy if exists "students_admin_all" on students;
create policy "students_admin_all" on students
  for all using (is_admin()) with check (is_admin());

drop policy if exists "students_teacher_select_assigned" on students;
create policy "students_teacher_select_assigned" on students
  for select using (
    exists (
      select 1 from student_teachers st
      where st.student_id = students.id and st.teacher_id = auth.uid()
    )
  );

-- student_teachers: 관리자는 전체 CRUD, 선생님은 본인 배정 건만 조회
drop policy if exists "student_teachers_admin_all" on student_teachers;
create policy "student_teachers_admin_all" on student_teachers
  for all using (is_admin()) with check (is_admin());

drop policy if exists "student_teachers_teacher_select_own" on student_teachers;
create policy "student_teachers_teacher_select_own" on student_teachers
  for select using (teacher_id = auth.uid());

-- class_logs: 관리자는 전체 열람(수정은 불가 — 작성자만 수정),
-- 선생님은 본인이 작성한(그리고 본인에게 배정된 학생의) 로그만 CRUD
drop policy if exists "class_logs_admin_select" on class_logs;
create policy "class_logs_admin_select" on class_logs
  for select using (is_admin());

drop policy if exists "class_logs_teacher_all_own" on class_logs;
create policy "class_logs_teacher_all_own" on class_logs
  for all using (teacher_id = auth.uid())
  with check (
    teacher_id = auth.uid()
    and exists (
      select 1 from student_teachers st
      where st.student_id = class_logs.student_id and st.teacher_id = auth.uid()
    )
  );

-- counseling_logs: class_logs와 동일한 패턴
drop policy if exists "counseling_logs_admin_select" on counseling_logs;
create policy "counseling_logs_admin_select" on counseling_logs
  for select using (is_admin());

drop policy if exists "counseling_logs_teacher_all_own" on counseling_logs;
create policy "counseling_logs_teacher_all_own" on counseling_logs
  for all using (teacher_id = auth.uid())
  with check (
    teacher_id = auth.uid()
    and exists (
      select 1 from student_teachers st
      where st.student_id = counseling_logs.student_id and st.teacher_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 10. 최초 관리자 계정 만들기 (수동, 1회만)
-- ----------------------------------------------------------------------------
-- 1) Supabase 대시보드 → Authentication → Users → "Add user"로 관리자 이메일/비밀번호 생성
--    (또는 Invite user로 초대 메일 발송)
-- 2) 생성된 사용자의 UUID를 복사해서 아래 UPDATE 실행 (트리거가 만든 기본 role='teacher'를 admin으로 변경)
--
--   update profiles set role = 'admin', full_name = '관리자 이름'
--   where id = '여기에-생성된-user-uuid-붙여넣기';
--
-- 이후부터는 이 계정으로 로그인해서 /admin에서 선생님 계정을 직접 만들 수 있습니다.
