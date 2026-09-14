export type Role = "admin" | "teacher";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
};

export type Student = {
  id: string;
  name: string;
  school: string | null;
  grade: string | null;
  contact: string | null;
  memo: string | null;
  created_at: string;
};

export type StudentTeacher = {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  created_at: string;
};

export type StudentTeacherWithNames = StudentTeacher & {
  student_name: string;
  teacher_name: string;
};

export const ATTENDANCE_OPTIONS = ["출석", "지각", "결석", "보강"] as const;
export type Attendance = (typeof ATTENDANCE_OPTIONS)[number];

export type ClassLog = {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  session_date: string;
  session_no: string | null;
  attendance: Attendance;
  content: string;
  homework_check: string | null;
  understanding: string | null;
  notes: string | null;
  next_plan: string | null;
  created_at: string;
  updated_at: string;
};

export const COUNSELING_TYPE_OPTIONS = [
  "신규 상담",
  "정기 전략 미팅",
  "원서/성적 리뷰",
  "기타",
] as const;
export type CounselingType = (typeof COUNSELING_TYPE_OPTIONS)[number];

export type CounselingLog = {
  id: string;
  student_id: string;
  teacher_id: string;
  session_datetime: string;
  type: CounselingType;
  parent_present: boolean;
  topic: string;
  summary: string;
  action_items: string | null;
  next_session_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ClassLogWithNames = ClassLog & { student_name: string; teacher_name: string };
export type CounselingLogWithNames = CounselingLog & { student_name: string; teacher_name: string };
