import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  LanguageCode,
  UserAccount,
  Student,
  Department,
  Course,
  CourseOffering,
  CourseEnrollment,
  GradeRecord,
  AuditLog,
  SystemAnnouncement,
  AttendanceRecord,
  AcademicCalendarConfig,
  SystemBackupEntry,
  ScoreBreakdown,
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_OFFERINGS,
  INITIAL_STUDENTS,
  INITIAL_ENROLLMENTS,
  INITIAL_GRADES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_CALENDAR_CONFIG,
  INITIAL_USERS,
  INITIAL_BACKUPS,
} from '../mockData/initialData';
import { calculateGrade, calculateSemesterGPA } from '../utils/gradeCalculations';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  currentUser: UserAccount;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Data entities
  departments: Department[];
  courses: Course[];
  offerings: CourseOffering[];
  students: Student[];
  enrollments: CourseEnrollment[];
  grades: GradeRecord[];
  auditLogs: AuditLog[];
  announcements: SystemAnnouncement[];
  attendance: AttendanceRecord[];
  calendarConfig: AcademicCalendarConfig;
  backups: SystemBackupEntry[];
  users: UserAccount[];

  // Student actions
  registerStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'cgpa' | 'totalCreditsEarned' | 'isArchived'>) => { success: boolean; error?: string; student?: Student };
  updateStudent: (id: string, updates: Partial<Student>, reason: string) => void;
  archiveStudent: (id: string, reason: string) => void;
  restoreStudent: (id: string) => void;

  // Course & Enrollment actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  requestAddDrop: (studentId: string, offeringId: string, actionType: 'Add' | 'Drop', reason: string) => { success: boolean; message: string };
  reviewAddDrop: (enrollmentId: string, status: 'Approved' | 'Rejected', notes: string) => void;

  // Gradebook actions
  saveGradeScores: (gradeId: string, scores: ScoreBreakdown, reason?: string) => void;
  submitGradesForReview: (offeringId: string) => void;
  approveGradesByDeptHead: (offeringId: string) => void;
  publishGradesByRegistrar: (offeringId: string) => void;

  // Attendance actions
  addAttendanceRecord: (offeringId: string, date: string, topic: string, records: { studentId: string; status: 'Present' | 'Absent' | 'Excused'; notes?: string }[]) => void;

  // System admin actions
  updateCalendarConfig: (config: Partial<AcademicCalendarConfig>) => void;
  createBackupSnapshot: () => SystemBackupEntry;
  restoreFromSnapshot: (snapshotData: any) => { success: boolean; message: string };
  bulkImportStudents: (newStudents: Partial<Student>[]) => { successCount: number; errors: string[] };
  addAuditLog: (module: AuditLog['module'], action: string, details: string, severity?: AuditLog['severity']) => void;

  // Notifications
  dismissAnnouncement: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('bru_sims_lang') as LanguageCode) || 'en';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('registrar');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [offerings, setOfferings] = useState<CourseOffering[]>(INITIAL_OFFERINGS);
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('bru_sims_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>(() => {
    const saved = localStorage.getItem('bru_sims_enrollments');
    return saved ? JSON.parse(saved) : INITIAL_ENROLLMENTS;
  });
  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    const saved = localStorage.getItem('bru_sims_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('bru_sims_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [calendarConfig, setCalendarConfig] = useState<AcademicCalendarConfig>(INITIAL_CALENDAR_CONFIG);
  const [backups, setBackups] = useState<SystemBackupEntry[]>(INITIAL_BACKUPS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

  // Derive current user based on currentRole
  const currentUser: UserAccount = users.find((u) => u.role === currentRole) || users[0];

  useEffect(() => {
    localStorage.setItem('bru_sims_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('bru_sims_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('bru_sims_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem('bru_sims_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('bru_sims_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const addAuditLog = (
    module: AuditLog['module'],
    action: string,
    details: string,
    severity: AuditLog['severity'] = 'Info'
  ) => {
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: formatted,
      userId: currentUser.id,
      userName: currentUser.fullName,
      role: currentRole,
      module,
      action,
      details,
      ipAddress: '10.20.4.' + (Math.floor(Math.random() * 80) + 10),
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    addAuditLog('RBAC & Users', 'Operating Role Switched', `Active session persona changed to ${role}.`);
  };

  // Student operations
  const registerStudent = (
    studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'cgpa' | 'totalCreditsEarned' | 'isArchived'>
  ) => {
    // Duplicate detection
    const duplicateId = students.find(
      (s) => s.studentId.trim().toLowerCase() === studentData.studentId.trim().toLowerCase()
    );
    if (duplicateId) {
      return { success: false, error: `Student ID "${studentData.studentId}" is already assigned to ${duplicateId.fullName}.` };
    }

    const duplicateNational = students.find(
      (s) => s.nationalId && s.nationalId.trim().toLowerCase() === studentData.nationalId.trim().toLowerCase()
    );
    if (duplicateNational) {
      return { success: false, error: `National ID "${studentData.nationalId}" already registered for ${duplicateNational.fullName}.` };
    }

    const now = new Date().toISOString().split('T')[0];
    const newStudent: Student = {
      ...studentData,
      id: `stud-${Date.now()}`,
      cgpa: 0.0,
      totalCreditsEarned: 0,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: `hist-${Date.now()}`,
          date: now,
          action: 'Initial Registration',
          changedBy: `${currentUser.fullName} (${currentUser.role})`,
          details: `Student registered in ${studentData.program}, Academic Year ${studentData.academicYear}.`,
        },
      ],
    };

    setStudents((prev) => [newStudent, ...prev]);
    addAuditLog(
      'Student Registry',
      'Student Created',
      `Registered new student: ${newStudent.fullName} (${newStudent.studentId}), Department: ${newStudent.departmentId}.`
    );

    return { success: true, student: newStudent };
  };

  const updateStudent = (id: string, updates: Partial<Student>, reason: string) => {
    const now = new Date().toISOString().split('T')[0];
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newHist = {
          id: `hist-${Date.now()}`,
          date: now,
          action: 'Record Correction & Update',
          changedBy: `${currentUser.fullName} (${currentUser.role})`,
          details: reason || 'Updated student profile and academic attributes.',
        };
        return {
          ...s,
          ...updates,
          updatedAt: now,
          history: [newHist, ...s.history],
        };
      })
    );
    addAuditLog('Student Registry', 'Record Modified', `Updated record for student ID ${id}. Reason: ${reason}`);
  };

  const archiveStudent = (id: string, reason: string) => {
    const now = new Date().toISOString().split('T')[0];
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          isArchived: true,
          history: [
            {
              id: `hist-${Date.now()}`,
              date: now,
              action: 'Archived Record',
              changedBy: `${currentUser.fullName} (${currentUser.role})`,
              details: reason || 'Archived per official registrar authorization.',
            },
            ...s.history,
          ],
        };
      })
    );
    addAuditLog('Student Registry', 'Record Archived', `Archived student ${id}. Reason: ${reason}`, 'Warning');
  };

  const restoreStudent = (id: string) => {
    const now = new Date().toISOString().split('T')[0];
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          isArchived: false,
          history: [
            {
              id: `hist-${Date.now()}`,
              date: now,
              action: 'Record Restored',
              changedBy: `${currentUser.fullName} (${currentUser.role})`,
              details: 'Record restored to active status.',
            },
            ...s.history,
          ],
        };
      })
    );
    addAuditLog('Student Registry', 'Record Restored', `Restored active record for student ${id}`);
  };

  // Course actions
  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `crs-${Date.now()}`,
    };
    setCourses((prev) => [...prev, newCourse]);
    addAuditLog('Course Enrollment', 'Course Created', `Created course ${newCourse.code}: ${newCourse.title}`);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog('Course Enrollment', 'Course Updated', `Updated course details for course ${id}`);
  };

  // Add/Drop
  const requestAddDrop = (
    studentId: string,
    offeringId: string,
    actionType: 'Add' | 'Drop',
    reason: string
  ) => {
    const offering = offerings.find((o) => o.id === offeringId);
    if (!offering) return { success: false, message: 'Course offering not found' };

    const existingEnrollment = enrollments.find(
      (e) => e.studentId === studentId && e.offeringId === offeringId
    );

    if (actionType === 'Add') {
      if (existingEnrollment && existingEnrollment.status === 'Approved') {
        return { success: false, message: 'Already approved and enrolled in this course.' };
      }
      if (offering.enrolledCount >= offering.capacity) {
        return { success: false, message: 'Course capacity has reached the maximum threshold.' };
      }

      const newEnrollment: CourseEnrollment = {
        id: `enr-${Date.now()}`,
        studentId,
        offeringId,
        courseId: offering.courseId,
        academicYear: offering.academicYear,
        semester: offering.semester,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Pending Add',
        requestReason: reason,
        attendancePercentage: 100,
      };

      setEnrollments((prev) => [newEnrollment, ...prev]);
      addAuditLog('Course Enrollment', 'Add Request Filed', `Student ${studentId} requested to add course ${offering.courseId}`);
      return { success: true, message: 'Course add request submitted for Department Head review.' };
    } else {
      // Drop
      if (!existingEnrollment || existingEnrollment.status !== 'Approved') {
        return { success: false, message: 'Cannot drop a course you are not actively enrolled in.' };
      }

      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === existingEnrollment.id
            ? { ...e, status: 'Pending Drop', requestReason: reason }
            : e
        )
      );
      addAuditLog('Course Enrollment', 'Drop Request Filed', `Student ${studentId} filed drop request for offering ${offeringId}`);
      return { success: true, message: 'Course drop request submitted for approval.' };
    }
  };

  const reviewAddDrop = (enrollmentId: string, status: 'Approved' | 'Rejected', notes: string) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;

    const now = new Date().toISOString().split('T')[0];
    const isDrop = enrollment.status === 'Pending Drop';

    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id !== enrollmentId) return e;
        return {
          ...e,
          status: status === 'Approved' ? (isDrop ? 'Dropped' : 'Approved') : 'Rejected',
          reviewNotes: notes,
          reviewedBy: `${currentUser.fullName} (${currentUser.role})`,
          reviewedAt: now,
        };
      })
    );

    // Update offering enrolledCount
    if (status === 'Approved') {
      setOfferings((prev) =>
        prev.map((o) => {
          if (o.id !== enrollment.offeringId) return o;
          return {
            ...o,
            enrolledCount: isDrop ? Math.max(0, o.enrolledCount - 1) : o.enrolledCount + 1,
          };
        })
      );
    }

    addAuditLog(
      'Course Enrollment',
      `Add/Drop ${status}`,
      `Enrollment ${enrollmentId} ${status.toLowerCase()} by ${currentUser.fullName}. Notes: ${notes}`
    );
  };

  // Gradebook operations
  const saveGradeScores = (gradeId: string, scores: ScoreBreakdown, reason = 'Continuous Assessment Entry') => {
    const totalMark = Number(
      (scores.quizzes + scores.assignments + scores.midterm + scores.finalExam).toFixed(1)
    );
    const { letterGrade, gradePoint } = calculateGrade(totalMark);
    const now = new Date().toISOString().split('T')[0];

    setGrades((prev) =>
      prev.map((g) => {
        if (g.id !== gradeId) return g;
        const changeHistory = [
          ...g.changeHistory,
          {
            date: now,
            changedBy: `${currentUser.fullName} (${currentUser.role})`,
            oldTotal: g.totalMark,
            newTotal: totalMark,
            oldGrade: g.letterGrade,
            newGrade: letterGrade,
            reason,
          },
        ];
        return {
          ...g,
          scores,
          totalMark,
          letterGrade,
          gradePoint,
          changeHistory,
        };
      })
    );

    addAuditLog(
      'Gradebook',
      'Score Updated',
      `Updated marks for grade record ${gradeId}: Total = ${totalMark} (${letterGrade}). Reason: ${reason}`
    );
  };

  const submitGradesForReview = (offeringId: string) => {
    const now = new Date().toISOString().split('T')[0];
    setGrades((prev) =>
      prev.map((g) =>
        g.offeringId === offeringId
          ? {
              ...g,
              status: 'Submitted',
              submittedBy: `${currentUser.fullName}`,
              submittedAt: now,
            }
          : g
      )
    );
    addAuditLog('Gradebook', 'Grades Submitted for Dept Review', `Offering ${offeringId} submitted by Instructor.`);
  };

  const approveGradesByDeptHead = (offeringId: string) => {
    const now = new Date().toISOString().split('T')[0];
    setGrades((prev) =>
      prev.map((g) =>
        g.offeringId === offeringId
          ? {
              ...g,
              status: 'Department_Approved',
              approvedBy: `${currentUser.fullName}`,
              approvedAt: now,
            }
          : g
      )
    );
    addAuditLog('Gradebook', 'Grades Approved by Dept Head', `Offering ${offeringId} approved by Department Head.`);
  };

  const publishGradesByRegistrar = (offeringId: string) => {
    const now = new Date().toISOString().split('T')[0];
    setGrades((prev) =>
      prev.map((g) =>
        g.offeringId === offeringId
          ? {
              ...g,
              status: 'Registrar_Published',
              publishedAt: now,
            }
          : g
      )
    );

    // Recalculate CGPA for affected students
    const affectedGrades = grades.filter((g) => g.offeringId === offeringId);
    const affectedStudentIds = Array.from(new Set(affectedGrades.map((g) => g.studentId)));

    setStudents((prev) =>
      prev.map((st) => {
        if (!affectedStudentIds.includes(st.id)) return st;

        // Find all published grades for this student
        const publishedForStudent = grades
          .filter((g) => g.studentId === st.id && (g.offeringId === offeringId || g.status === 'Registrar_Published'))
          .map((g) => {
            const course = courses.find((c) => c.id === g.courseId);
            return {
              creditHours: course?.creditHours || 3,
              gradePoint: g.gradePoint,
              letterGrade: g.letterGrade,
            };
          });

        const { gpa, totalCredits } = calculateSemesterGPA(publishedForStudent);
        return {
          ...st,
          cgpa: gpa,
          totalCreditsEarned: totalCredits,
        };
      })
    );

    addAuditLog(
      'Gradebook',
      'Official Grade Publication',
      `Registrar published grades for offering ${offeringId}. Student transcripts updated with verified status.`
    );
  };

  // Attendance recording
  const addAttendanceRecord = (
    offeringId: string,
    date: string,
    topic: string,
    records: { studentId: string; status: 'Present' | 'Absent' | 'Excused'; notes?: string }[]
  ) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      offeringId,
      date,
      lectureTopic: topic,
      records,
    };
    setAttendance((prev) => [newRecord, ...prev]);

    // Update enrollment attendance percentage
    setEnrollments((prev) =>
      prev.map((enr) => {
        if (enr.offeringId !== offeringId) return enr;
        const matchingRecords = records.find((r) => r.studentId === enr.studentId);
        if (!matchingRecords) return enr;

        // Calculate all sessions for this offering & student
        const allSessions = [newRecord, ...attendance.filter((a) => a.offeringId === offeringId)];
        let totalPresent = 0;
        let totalHeld = 0;
        for (const s of allSessions) {
          const stRec = s.records.find((r) => r.studentId === enr.studentId);
          if (stRec) {
            totalHeld++;
            if (stRec.status === 'Present' || stRec.status === 'Excused') {
              totalPresent++;
            }
          }
        }
        const pct = totalHeld > 0 ? Math.round((totalPresent / totalHeld) * 100) : 100;
        return { ...enr, attendancePercentage: pct };
      })
    );

    addAuditLog('Student Registry', 'Attendance Logged', `Lecture session recorded for offering ${offeringId}. Topic: ${topic}`);
  };

  // Admin configuration
  const updateCalendarConfig = (updates: Partial<AcademicCalendarConfig>) => {
    setCalendarConfig((prev) => ({ ...prev, ...updates }));
    addAuditLog('System Settings', 'Academic Calendar Updated', 'Institutional calendar parameters modified.');
  };

  // Backup snapshot
  const createBackupSnapshot = (): SystemBackupEntry => {
    const now = new Date();
    const tsStr = now.toISOString().replace(/[:.]/g, '-');
    const filename = `borana_univ_sims_backup_${tsStr}.json`;

    const snapshotPayload = {
      timestamp: now.toISOString(),
      institution: 'Borana University',
      system: 'BRU-SIMS',
      calendarConfig,
      departments,
      courses,
      offerings,
      students,
      enrollments,
      grades,
      auditLogs,
      announcements,
      attendance,
    };

    const jsonStr = JSON.stringify(snapshotPayload, null, 2);
    const sizeKb = Math.round(jsonStr.length / 1024);

    const newBackup: SystemBackupEntry = {
      id: `bak-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`,
      filename,
      sizeKb,
      createdBy: `${currentUser.fullName} (${currentUser.role})`,
      recordCounts: {
        students: students.length,
        courses: courses.length,
        enrollments: enrollments.length,
        grades: grades.length,
      },
    };

    setBackups((prev) => [newBackup, ...prev]);
    addAuditLog('Backup & Recovery', 'Database Snapshot Created', `Backup file created: ${filename} (${sizeKb} KB).`);

    // Initiate file download in browser
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return newBackup;
  };

  const restoreFromSnapshot = (snapshotData: any) => {
    try {
      if (!snapshotData || !snapshotData.students || !snapshotData.courses) {
        return { success: false, message: 'Invalid backup file schema: Missing critical academic tables.' };
      }

      if (snapshotData.departments) setDepartments(snapshotData.departments);
      if (snapshotData.courses) setCourses(snapshotData.courses);
      if (snapshotData.offerings) setOfferings(snapshotData.offerings);
      if (snapshotData.students) setStudents(snapshotData.students);
      if (snapshotData.enrollments) setEnrollments(snapshotData.enrollments);
      if (snapshotData.grades) setGrades(snapshotData.grades);
      if (snapshotData.calendarConfig) setCalendarConfig(snapshotData.calendarConfig);

      addAuditLog(
        'Backup & Recovery',
        'Database Restored',
        `Restored data snapshot from ${snapshotData.timestamp || 'external file'}. Total students: ${snapshotData.students.length}`,
        'Warning'
      );

      return { success: true, message: 'Database successfully restored from backup snapshot.' };
    } catch (err: any) {
      return { success: false, message: `Restoration failed: ${err.message}` };
    }
  };

  const bulkImportStudents = (newStudentsList: Partial<Student>[]) => {
    const errors: string[] = [];
    let successCount = 0;
    const addedStudents: Student[] = [];
    const now = new Date().toISOString().split('T')[0];

    newStudentsList.forEach((st, idx) => {
      const rowNum = idx + 1;
      if (!st.studentId || !st.fullName || !st.departmentId) {
        errors.push(`Row ${rowNum}: Missing mandatory fields (Student ID, Full Name, or Department).`);
        return;
      }

      const dup = students.find(
        (s) => s.studentId.trim().toLowerCase() === st.studentId!.trim().toLowerCase()
      );
      if (dup) {
        errors.push(`Row ${rowNum}: Duplicate Student ID "${st.studentId}" already exists.`);
        return;
      }

      const created: Student = {
        id: `stud-${Date.now()}-${idx}`,
        studentId: st.studentId,
        nationalId: st.nationalId || `ETH-BOR-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: st.fullName,
        gender: st.gender || 'Male',
        birthDate: st.birthDate || '2004-01-01',
        phone: st.phone || '+251 91 000 0000',
        email: st.email || `${st.studentId.replace(/\//g, '.').toLowerCase()}@student.bru.edu.et`,
        address: st.address || 'Yabello Campus',
        woredaZone: st.woredaZone || 'Borana Zone, Oromia',
        emergencyContact: st.emergencyContact || { name: 'Family Contact', phone: '+251 91 000 0000', relation: 'Parent' },
        parentGuardian: st.parentGuardian || { name: 'Parent / Guardian', phone: '+251 91 000 0000', email: '', relationship: 'Parent', canViewGrades: true },
        admissionYear: st.admissionYear || 2026,
        academicYear: st.academicYear || calendarConfig.academicYear,
        departmentId: st.departmentId,
        program: st.program || 'B.Sc. Undergraduate Degree',
        yearOfStudy: st.yearOfStudy || 1,
        currentSemester: st.currentSemester || 1,
        academicStatus: 'Active',
        isArchived: false,
        cgpa: 0.0,
        totalCreditsEarned: 0,
        createdAt: now,
        updatedAt: now,
        history: [
          {
            id: `hist-${Date.now()}-${idx}`,
            date: now,
            action: 'Bulk Spreadsheet Import',
            changedBy: `${currentUser.fullName} (${currentUser.role})`,
            details: 'Imported via registrar bulk spreadsheet batch.',
          },
        ],
      };

      addedStudents.push(created);
      successCount++;
    });

    if (addedStudents.length > 0) {
      setStudents((prev) => [...addedStudents, ...prev]);
      addAuditLog(
        'Student Registry',
        'Bulk Student Import',
        `Imported ${successCount} new student records from spreadsheet. Errors encountered: ${errors.length}`
      );
    }

    return { successCount, errors };
  };

  const dismissAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentRole,
        switchRole,
        currentUser,
        activeTab,
        setActiveTab,
        departments,
        courses,
        offerings,
        students,
        enrollments,
        grades,
        auditLogs,
        announcements,
        attendance,
        calendarConfig,
        backups,
        users,
        registerStudent,
        updateStudent,
        archiveStudent,
        restoreStudent,
        addCourse,
        updateCourse,
        requestAddDrop,
        reviewAddDrop,
        saveGradeScores,
        submitGradesForReview,
        approveGradesByDeptHead,
        publishGradesByRegistrar,
        addAttendanceRecord,
        updateCalendarConfig,
        createBackupSnapshot,
        restoreFromSnapshot,
        bulkImportStudents,
        addAuditLog,
        dismissAnnouncement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
