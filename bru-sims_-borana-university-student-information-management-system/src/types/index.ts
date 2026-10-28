/**
 * BRU-SIMS Type Definitions
 * Borana University Student Information Management System
 */

export type UserRole =
  | 'admin'
  | 'registrar'
  | 'department_head'
  | 'instructor'
  | 'student'
  | 'management'
  | 'parent'
  | 'ict_support';

export type LanguageCode = 'en' | 'om' | 'am';

export type AcademicStatus =
  | 'Active'
  | 'Academic Warning'
  | 'Academic Probation'
  | 'Suspended'
  | 'Withdrawn'
  | 'Graduated';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  associatedStudentId?: string; // For student or parent
  avatarUrl?: string;
  status: 'Active' | 'Deactivated';
  lastLogin?: string;
  phoneNumber?: string;
}

export interface StudentHistoryRecord {
  id: string;
  date: string;
  action: string;
  changedBy: string;
  details: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. BRU/UG/2024/0101
  nationalId: string;
  fullName: string;
  gender: 'Male' | 'Female';
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  woredaZone: string; // Borana Zone / Oromia
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  parentGuardian: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
    canViewGrades: boolean;
  };
  admissionYear: number;
  academicYear: string; // e.g. "2026/2027"
  departmentId: string;
  program: string;
  yearOfStudy: number; // 1, 2, 3, 4, 5
  currentSemester: number; // 1 to 10
  academicStatus: AcademicStatus;
  isArchived: boolean;
  cgpa: number;
  totalCreditsEarned: number;
  createdAt: string;
  updatedAt: string;
  history: StudentHistoryRecord[];
}

export interface Department {
  id: string;
  code: string;
  name: string;
  nameOm: string;
  nameAm: string;
  faculty: string;
  headInstructorId: string;
  officeLocation: string;
  contactEmail: string;
}

export interface AssessmentWeights {
  quizzes: number;     // e.g. 15%
  assignments: number; // e.g. 15%
  midterm: number;     // e.g. 30%
  finalExam: number;   // e.g. 40%
}

export interface Course {
  id: string;
  code: string; // e.g. COSC3011
  title: string;
  creditHours: number;
  lectureHours: number;
  labHours: number;
  departmentId: string;
  targetYear: number;
  targetSemester: number;
  prerequisites: string[]; // course codes
  description: string;
  assessmentWeights: AssessmentWeights;
  isActive: boolean;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  academicYear: string;
  semester: number;
  section: string;
  instructorId: string;
  capacity: number;
  enrolledCount: number;
  classroom: string;
  scheduleDays: string; // e.g. "Mon, Wed 08:30 - 10:00"
  examDate?: string;
  examRoom?: string;
  status: 'Open' | 'Closed' | 'Grading' | 'Completed';
}

export type EnrollmentStatus =
  | 'Registered'
  | 'Pending Add'
  | 'Pending Drop'
  | 'Approved'
  | 'Dropped'
  | 'Rejected';

export interface CourseEnrollment {
  id: string;
  studentId: string;
  offeringId: string;
  courseId: string;
  academicYear: string;
  semester: number;
  registrationDate: string;
  status: EnrollmentStatus;
  requestReason?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  attendancePercentage: number;
}

export type GradeStatus =
  | 'Draft'
  | 'Submitted'
  | 'Department_Approved'
  | 'Registrar_Published';

export interface ScoreBreakdown {
  quizzes: number;
  assignments: number;
  midterm: number;
  finalExam: number;
}

export interface GradeChangeLog {
  date: string;
  changedBy: string;
  oldTotal: number;
  newTotal: number;
  oldGrade: string;
  newGrade: string;
  reason: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  offeringId: string;
  academicYear: string;
  semester: number;
  scores: ScoreBreakdown;
  totalMark: number;
  letterGrade: string;
  gradePoint: number;
  status: GradeStatus;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  changeHistory: GradeChangeLog[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  module:
    | 'Student Registry'
    | 'Course Enrollment'
    | 'Gradebook'
    | 'Academic Records'
    | 'Transcripts'
    | 'RBAC & Users'
    | 'System Settings'
    | 'Backup & Recovery';
  action: string;
  details: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  targetRoles: UserRole[];
  author: string;
  isImportant: boolean;
}

export interface AttendanceRecord {
  id: string;
  offeringId: string;
  date: string;
  lectureTopic: string;
  records: {
    studentId: string;
    status: 'Present' | 'Absent' | 'Excused';
    notes?: string;
  }[];
}

export interface AcademicCalendarConfig {
  academicYear: string;
  currentSemester: number;
  semesterStartDate: string;
  semesterEndDate: string;
  addDropDeadline: string;
  gradeSubmissionDeadline: string;
  maxCreditHoursAllowed: number;
  minPassingGradePoint: number; // 2.0
  academicProbationThreshold: number; // 2.0
  goodStandingThreshold: number; // 2.0
  distinctionThreshold: number; // 3.5
  greatDistinctionThreshold: number; // 3.8
  systemLockdown: boolean;
}

export interface SystemBackupEntry {
  id: string;
  timestamp: string;
  filename: string;
  sizeKb: number;
  createdBy: string;
  recordCounts: {
    students: number;
    courses: number;
    enrollments: number;
    grades: number;
  };
}
