import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ClassLogWithNames,
  CounselingLogWithNames,
  Profile,
  Student,
  StudentTeacherWithNames,
} from "@/lib/types";

// ---- 관리자용 조회 ----------------------------------------------------

export async function getAllTeachers(supabase: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .order("full_name");
  if (error) throw error;
  return data ?? [];
}

export async function getAllStudents(supabase: SupabaseClient): Promise<Student[]> {
  const { data, error } = await supabase.from("students").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getStudent(
  supabase: SupabaseClient,
  studentId: string
): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();
  if (error) return null;
  return data;
}

export async function getStudentAssignments(
  supabase: SupabaseClient,
  studentId: string
): Promise<StudentTeacherWithNames[]> {
  const { data, error } = await supabase
    .from("student_teachers")
    .select("*, student:students(name), teacher:profiles(full_name)")
    .eq("student_id", studentId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    student_id: row.student_id,
    teacher_id: row.teacher_id,
    subject: row.subject,
    created_at: row.created_at,
    student_name: row.student?.name ?? "",
    teacher_name: row.teacher?.full_name ?? "",
  }));
}

export async function getAllClassLogsForAdmin(
  supabase: SupabaseClient
): Promise<ClassLogWithNames[]> {
  const { data, error } = await supabase
    .from("class_logs")
    .select("*, student:students(name), teacher:profiles(full_name)")
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    student_name: row.student?.name ?? "(삭제된 학생)",
    teacher_name: row.teacher?.full_name ?? "(삭제된 선생님)",
  }));
}

export async function getAllCounselingLogsForAdmin(
  supabase: SupabaseClient
): Promise<CounselingLogWithNames[]> {
  const { data, error } = await supabase
    .from("counseling_logs")
    .select("*, student:students(name), teacher:profiles(full_name)")
    .order("session_datetime", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    student_name: row.student?.name ?? "(삭제된 학생)",
    teacher_name: row.teacher?.full_name ?? "(삭제된 선생님)",
  }));
}

// ---- 선생님용 조회 ------------------------------------------------------

export type AssignedStudent = {
  student_id: string;
  student_name: string;
  subjects: string[];
};

// 로그인한 선생님에게 배정된 학생 목록 (과목은 한 학생에 여러 건일 수 있어 합쳐줌)
export async function getMyStudents(
  supabase: SupabaseClient,
  teacherId: string
): Promise<AssignedStudent[]> {
  const { data, error } = await supabase
    .from("student_teachers")
    .select("subject, student:students(id, name)")
    .eq("teacher_id", teacherId);
  if (error) throw error;

  const map = new Map<string, AssignedStudent>();
  for (const row of data ?? []) {
    const s = row.student as unknown as { id: string; name: string } | null;
    if (!s) continue;
    if (!map.has(s.id)) {
      map.set(s.id, { student_id: s.id, student_name: s.name, subjects: [] });
    }
    map.get(s.id)!.subjects.push(row.subject);
  }
  return Array.from(map.values()).sort((a, b) => a.student_name.localeCompare(b.student_name, "ko"));
}

export type AssignmentOption = { student_id: string; student_name: string; subject: string };

// 로그인한 선생님의 (학생, 과목) 배정 조합 원본 목록 — 일지 작성 폼의 드롭다운에 사용.
// 한 학생에 같은 선생님이 여러 과목을 맡을 수 있어 그룹핑하지 않고 그대로 반환합니다.
export async function getMyAssignmentOptions(
  supabase: SupabaseClient,
  teacherId: string
): Promise<AssignmentOption[]> {
  const { data, error } = await supabase
    .from("student_teachers")
    .select("subject, student:students(id, name)")
    .eq("teacher_id", teacherId);
  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const s = row.student as unknown as { id: string; name: string } | null;
      if (!s) return null;
      return { student_id: s.id, student_name: s.name, subject: row.subject };
    })
    .filter((v): v is AssignmentOption => v !== null)
    .sort(
      (a, b) =>
        a.student_name.localeCompare(b.student_name, "ko") || a.subject.localeCompare(b.subject, "ko")
    );
}

export async function getMyClassLogs(
  supabase: SupabaseClient,
  teacherId: string
): Promise<ClassLogWithNames[]> {
  const { data, error } = await supabase
    .from("class_logs")
    .select("*, student:students(name), teacher:profiles(full_name)")
    .eq("teacher_id", teacherId)
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    student_name: row.student?.name ?? "(삭제된 학생)",
    teacher_name: row.teacher?.full_name ?? "",
  }));
}

export async function getClassLogById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("class_logs").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getCounselingLogById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("counseling_logs").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getMyCounselingLogs(
  supabase: SupabaseClient,
  teacherId: string
): Promise<CounselingLogWithNames[]> {
  const { data, error } = await supabase
    .from("counseling_logs")
    .select("*, student:students(name), teacher:profiles(full_name)")
    .eq("teacher_id", teacherId)
    .order("session_datetime", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    student_name: row.student?.name ?? "(삭제된 학생)",
    teacher_name: row.teacher?.full_name ?? "",
  }));
}
