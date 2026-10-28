import React from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { evaluateAcademicStanding } from '../../utils/gradeCalculations';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Calendar,
  FileText,
  UserPlus,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentRole,
    currentUser,
    language,
    students,
    courses,
    offerings,
    enrollments,
    grades,
    auditLogs,
    calendarConfig,
    setActiveTab,
  } = useApp();

  // Statistics
  const activeStudents = students.filter((s) => !s.isArchived);
  const pendingAddDrop = enrollments.filter(
    (e) => e.status === 'Pending Add' || e.status === 'Pending Drop'
  );
  const pendingGradeApprovals = grades.filter(
    (g) => g.status === 'Submitted' || g.status === 'Department_Approved'
  );
  const averageCgpa = (
    activeStudents.reduce((acc, s) => acc + s.cgpa, 0) / (activeStudents.length || 1)
  ).toFixed(2);

  // Student persona specifics (e.g., Jemal Boru Guyo)
  const currentStudent = students.find((s) => s.id === (currentUser.associatedStudentId || 'stud-1')) || students[0];
  const studentEnrollments = enrollments.filter(
    (e) => e.studentId === currentStudent?.id && (e.status === 'Approved' || e.status === 'Registered')
  );
  const studentStanding = evaluateAcademicStanding(currentStudent?.cgpa || 0);

  // Instructor persona specifics
  const instructorOfferings = offerings.filter(
    (o) => o.instructorId === (currentUser.id === 'user-instructor' ? 'user-instructor' : 'user-dept-head')
  );

  return (
    <div className="space-y-6">
      {/* Institutional Hero Banner with Campus Image */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-white shadow-xs">
        <div className="absolute inset-0 z-0 opacity-35">
          <img
            src="/src/assets/images/bru_campus_hero_1793125544198.jpg"
            alt="Borana University Library and Campus"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400">
              <span>{t('systemSubtitle', language)}</span>
              <span>·</span>
              <span>Academic Year {calendarConfig.academicYear}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {currentUser.fullName}
            </h1>
            <p className="mt-2 text-sm text-slate-200 leading-relaxed">
              Borana University Portal · Currently operating with{' '}
              <strong className="text-white uppercase font-semibold">{currentRole.replace('_', ' ')}</strong> permissions.
              Official Senate academic deadlines and continuous assessment guidelines are active.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/15 text-xs">
              <span className="text-slate-300 block text-[11px]">Add/Drop Window Closes</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">{calendarConfig.addDropDeadline}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/15 text-xs">
              <span className="text-slate-300 block text-[11px]">Grade Submission Deadline</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{calendarConfig.gradeSubmissionDeadline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Metric Cards */}
      {currentRole === 'student' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative CGPA</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-emerald-700 tabular-nums">
                {currentStudent.cgpa.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">/ 4.00</span>
            </div>
            <p className="text-xs text-emerald-600 mt-2 font-medium">{studentStanding.standingLabel}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credits Completed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {currentStudent.totalCreditsEarned}
              </span>
              <span className="text-xs text-slate-400">of 142 req.</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Year {currentStudent.yearOfStudy} · Semester {currentStudent.currentSemester}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Courses</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-blue-700 tabular-nums">
                {studentEnrollments.length}
              </span>
              <span className="text-xs text-slate-400">enrolled</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Continuous assessment in progress</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Standing</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold text-slate-900">
                {currentStudent.academicStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Program: {currentStudent.program}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('totalStudents', language)}
              </span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {activeStudents.length}
              </span>
              <span className="text-xs text-slate-400">({students.filter((s) => s.isArchived).length} archived)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Enrolled across 5 accredited faculties</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('activeCourses', language)}
              </span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {courses.length}
              </span>
              <span className="text-xs text-slate-400">({offerings.length} sections active)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Semester I offering catalog</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Add/Drop
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-amber-700 tabular-nums">
                {pendingAddDrop.length}
              </span>
              <span className="text-xs text-slate-400">awaiting approval</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Senate deadline: {calendarConfig.addDropDeadline}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('averageCgpa', language)}
              </span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-purple-700 tabular-nums">
                {averageCgpa}
              </span>
              <span className="text-xs text-slate-400">institutional avg</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Ministry of Education standard scale</p>
          </div>
        </div>
      )}

      {/* Main Grid: Workflows & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operational Workflows */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Authorized Priority Operations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(currentRole === 'registrar' || currentRole === 'admin') && (
                <>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                      Register Student
                    </span>
                    <span className="text-[11px] text-slate-500">Enroll new candidate</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('courses')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
                  >
                    <Clock className="w-4 h-4 text-blue-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-900">
                      Add/Drop Queue
                    </span>
                    <span className="text-[11px] text-slate-500">{pendingAddDrop.length} pending review</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('grades')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50/40 transition-all group"
                  >
                    <Award className="w-4 h-4 text-purple-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-purple-900">
                      Publish Grades
                    </span>
                    <span className="text-[11px] text-slate-500">Official Senate seal</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transcripts')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/40 transition-all group"
                  >
                    <FileText className="w-4 h-4 text-teal-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-teal-900">
                      Issue Transcript
                    </span>
                    <span className="text-[11px] text-slate-500">Official document</span>
                  </button>
                </>
              )}

              {currentRole === 'instructor' && (
                <>
                  <button
                    onClick={() => setActiveTab('grades')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
                  >
                    <Award className="w-4 h-4 text-blue-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Enter Gradebook Scores
                    </span>
                    <span className="text-[11px] text-slate-500">Continuous assessments</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
                  >
                    <Clock className="w-4 h-4 text-emerald-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Record Attendance
                    </span>
                    <span className="text-[11px] text-slate-500">Lecture session log</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('courses')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50/40 transition-all group"
                  >
                    <Users className="w-4 h-4 text-purple-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Class Rosters
                    </span>
                    <span className="text-[11px] text-slate-500">Export student list</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-amber-500 hover:bg-amber-50/40 transition-all group"
                  >
                    <Calendar className="w-4 h-4 text-amber-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      My Schedule
                    </span>
                    <span className="text-[11px] text-slate-500">Lecture rooms & hours</span>
                  </button>
                </>
              )}

              {currentRole === 'student' && (
                <>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
                  >
                    <BookOpen className="w-4 h-4 text-blue-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Course Add/Drop
                    </span>
                    <span className="text-[11px] text-slate-500">Submit adjustment petition</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('grades')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
                  >
                    <Award className="w-4 h-4 text-emerald-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      View Grade Breakdown
                    </span>
                    <span className="text-[11px] text-slate-500">Quizzes, midterm, final</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transcripts')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50/40 transition-all group"
                  >
                    <FileText className="w-4 h-4 text-purple-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Generate Transcript
                    </span>
                    <span className="text-[11px] text-slate-500">Official printable copy</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-amber-500 hover:bg-amber-50/40 transition-all group"
                  >
                    <Calendar className="w-4 h-4 text-amber-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Exam Timetable
                    </span>
                    <span className="text-[11px] text-slate-500">Dates & hall seating</span>
                  </button>
                </>
              )}

              {(currentRole === 'department_head' || currentRole === 'management' || currentRole === 'parent' || currentRole === 'ict_support') && (
                <>
                  <button
                    onClick={() => setActiveTab('progression')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Academic Progress
                    </span>
                    <span className="text-[11px] text-slate-500">Standing & Support</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transcripts')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
                  >
                    <FileText className="w-4 h-4 text-blue-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Transcripts
                    </span>
                    <span className="text-[11px] text-slate-500">Academic records</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('audit_logs')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50/40 transition-all group"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      Audit Trail
                    </span>
                    <span className="text-[11px] text-slate-500">Compliance & history</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('admin_config')}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-all group"
                  >
                    <Building2 className="w-4 h-4 text-slate-700 mb-1.5" />
                    <span className="block text-xs font-bold text-slate-800">
                      System Administration
                    </span>
                    <span className="text-[11px] text-slate-500">Institutional control</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Student Specific Enrolled Courses Table */}
          {currentRole === 'student' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Current Semester Registered Courses</h3>
                  <p className="text-xs text-slate-500">Academic Year {calendarConfig.academicYear} · Semester I</p>
                </div>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  Manage Courses <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {studentEnrollments.map((enr) => {
                  const course = courses.find((c) => c.id === enr.courseId);
                  const offering = offerings.find((o) => o.id === enr.offeringId);
                  const grade = grades.find((g) => g.studentId === currentStudent.id && g.courseId === enr.courseId);

                  return (
                    <div key={enr.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-800">{course?.code}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-900">{course?.title}</span>
                          <span className="text-slate-500">({course?.creditHours} Cr)</span>
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-2">
                          <span>{offering?.classroom}</span>
                          <span>·</span>
                          <span>{offering?.scheduleDays}</span>
                          <span>·</span>
                          <span className="tabular-nums font-mono text-emerald-700">Attendance: {enr.attendancePercentage}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {grade && grade.status === 'Registrar_Published' ? (
                          <div className="text-right">
                            <span className="font-bold text-sm text-slate-900 font-mono tabular-nums">{grade.letterGrade}</span>
                            <span className="block text-[10px] text-emerald-600">Published ({grade.gradePoint.toFixed(2)})</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Assessment in Progress
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Institutional Registry Overview */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Student Enrollees</h3>
                  <p className="text-xs text-slate-500">Borana University Registrar Directory</p>
                </div>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  View All Records <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Student ID</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Year / Sem</th>
                      <th className="px-4 py-3 text-right">CGPA</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeStudents.slice(0, 5).map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-emerald-800">{st.studentId}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{st.fullName}</td>
                        <td className="px-4 py-3 text-slate-600">{st.program}</td>
                        <td className="px-4 py-3 text-slate-600 tabular-nums">Yr {st.yearOfStudy} · Sem {st.currentSemester}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                          {st.cgpa > 0 ? st.cgpa.toFixed(2) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              st.academicStatus === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {st.academicStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Activity Stream & Institutional Notices */}
        <div className="space-y-6">
          {/* Recent Audit Activity */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('recentActivity', language)}
              </h3>
              <button
                onClick={() => setActiveTab('audit_logs')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Full Log
              </button>
            </div>
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="border-l-2 border-slate-300 pl-3 py-1 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{log.action}</span>
                    <span className="tabular-nums font-mono">{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{log.details}</p>
                  <div className="text-[10px] text-slate-400">
                    <span>{log.userName}</span> · <span>{log.module}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Regulations Reference */}
          <div className="bg-emerald-950 text-emerald-100 p-5 rounded-xl border border-emerald-900 shadow-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Borana University Grading System
            </h3>
            <p className="text-xs text-emerald-300 mb-3">
              Standard Ministry of Education scale enforced by Senate academic legislation.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-1">
                <span>90 – 100%</span>
                <span className="font-mono font-bold text-white">A+ (4.00) · Very High Distinction</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-1">
                <span>85 – 89%</span>
                <span className="font-mono font-bold text-white">A (4.00) · Excellent</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-1">
                <span>80 – 84%</span>
                <span className="font-mono font-bold text-white">A- (3.75) · Very Good</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-1">
                <span>75 – 79%</span>
                <span className="font-mono font-bold text-white">B+ (3.50) · Good</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-1">
                <span>50 – 59%</span>
                <span className="font-mono font-bold text-white">C (2.00) · Minimum Pass</span>
              </div>
              <div className="flex items-center justify-between pt-0.5 text-amber-300">
                <span>Below 2.00 CGPA</span>
                <span className="font-bold">Academic Probation / Warning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
