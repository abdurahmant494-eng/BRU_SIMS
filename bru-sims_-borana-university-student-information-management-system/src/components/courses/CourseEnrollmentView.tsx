import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseOffering, CourseEnrollment, UserRole } from '../../types';
import { t } from '../../utils/translations';
import {
  BookOpen,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Search,
  Filter,
  Layers,
  ArrowRight,
  AlertCircle,
  Download,
  Calendar,
  Building,
} from 'lucide-react';

export const CourseEnrollmentView: React.FC = () => {
  const {
    courses,
    offerings,
    enrollments,
    departments,
    students,
    currentRole,
    currentUser,
    language,
    requestAddDrop,
    reviewAddDrop,
    addCourse,
    calendarConfig,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'offerings' | 'add_drop_queue' | 'my_enrollments'>('offerings');
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);

  // Add/drop request modal
  const [showAddDropModal, setShowAddDropModal] = useState(false);
  const [targetOfferingId, setTargetOfferingId] = useState(offerings[0]?.id || '');
  const [reqActionType, setReqActionType] = useState<'Add' | 'Drop'>('Add');
  const [reqReason, setReqReason] = useState('');
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Add Course modal
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCreditHours, setNewCreditHours] = useState(3);
  const [newLectureHours, setNewLectureHours] = useState(2);
  const [newLabHours, setNewLabHours] = useState(2);
  const [newDeptId, setNewDeptId] = useState(departments[0]?.id || 'dept-cs');
  const [newTargetYear, setNewTargetYear] = useState(3);
  const [newTargetSem, setNewTargetSem] = useState(1);
  const [newPrereqs, setNewPrereqs] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Add/Drop review state
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  // Current student context if student role
  const currentStudent = students.find((s) => s.id === (currentUser.associatedStudentId || 'stud-1')) || students[0];
  const isStudent = currentRole === 'student';
  const canApprove = currentRole === 'department_head' || currentRole === 'registrar' || currentRole === 'admin';
  const canCreateCourse = currentRole === 'registrar' || currentRole === 'department_head' || currentRole === 'admin';

  // Handlers
  const handleAddDropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    if (!reqReason.trim()) {
      setModalFeedback({ type: 'error', msg: 'Please provide an official justification for this Add/Drop request.' });
      return;
    }

    const res = requestAddDrop(currentStudent.id, targetOfferingId, reqActionType, reqReason);
    if (res.success) {
      setModalFeedback({ type: 'success', msg: res.message });
      setTimeout(() => {
        setShowAddDropModal(false);
        setReqReason('');
        setModalFeedback(null);
      }, 1500);
    } else {
      setModalFeedback({ type: 'error', msg: res.message });
    }
  };

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) {
      alert('Please fill out Course Code and Title.');
      return;
    }

    const prereqList = newPrereqs
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    addCourse({
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      creditHours: Number(newCreditHours),
      lectureHours: Number(newLectureHours),
      labHours: Number(newLabHours),
      departmentId: newDeptId,
      targetYear: Number(newTargetYear),
      targetSemester: Number(newTargetSem),
      prerequisites: prereqList,
      description: newDescription.trim(),
      assessmentWeights: { quizzes: 15, assignments: 15, midterm: 30, finalExam: 40 },
      isActive: true,
    });

    setShowNewCourseModal(false);
    setNewCode('');
    setNewTitle('');
    setNewDescription('');
    setNewPrereqs('');
  };

  const handleReviewAction = (enrollmentId: string, status: 'Approved' | 'Rejected') => {
    const note = reviewNotes[enrollmentId] || `Official Senate ${status.toLowerCase()} action.`;
    reviewAddDrop(enrollmentId, status, note);
  };

  // Pending queue
  const pendingRequests = enrollments.filter(
    (e) => e.status === 'Pending Add' || e.status === 'Pending Drop'
  );

  // Student specific enrollments
  const myEnrollments = enrollments.filter((e) => e.studentId === currentStudent.id);

  // Export class roster for selected offering
  const exportClassRoster = (offering: CourseOffering) => {
    const course = courses.find((c) => c.id === offering.courseId);
    const enrolledStudents = enrollments
      .filter((e) => e.offeringId === offering.id && (e.status === 'Approved' || e.status === 'Registered'))
      .map((e) => {
        const st = students.find((s) => s.id === e.studentId);
        return [
          `"${st?.studentId || 'N/A'}"`,
          `"${st?.fullName || 'N/A'}"`,
          `"${st?.program || 'N/A'}"`,
          `"${e.registrationDate}"`,
          `"${e.attendancePercentage}%"`,
        ];
      });

    const headers = ['Student ID', 'Full Name', 'Degree Program', 'Enrolled Date', 'Attendance'];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`"Class Roster - Borana University - ${course?.code} ${course?.title} (${offering.section})"`, '', headers.join(','), ...enrolledStudents.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roster_${course?.code}_${offering.section}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isStudent ? 'Course Registration & Enrollment' : t('courseEnrollment', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {calendarConfig.academicYear} · Semester {calendarConfig.currentSemester}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Curriculum offerings, section capacities, student add/drop workflows, and class rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isStudent && (
            <button
              onClick={() => {
                setShowAddDropModal(true);
                setReqActionType('Add');
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Add/Drop</span>
            </button>
          )}

          {canCreateCourse && (
            <button
              onClick={() => setShowNewCourseModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Course</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('offerings')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'offerings'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Active Semester Offerings ({offerings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'catalog'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          University Course Catalog ({courses.length})
        </button>

        <button
          onClick={() => setActiveSubTab('add_drop_queue')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'add_drop_queue'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Add/Drop Petition Queue</span>
          {pendingRequests.length > 0 && (
            <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>

        {isStudent && (
          <button
            onClick={() => setActiveSubTab('my_enrollments')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'my_enrollments'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            My Enrolled Schedule ({myEnrollments.length})
          </button>
        )}
      </div>

      {/* SubTab 1: Semester Offerings */}
      {activeSubTab === 'offerings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offerings.map((offering) => {
              const course = courses.find((c) => c.id === offering.courseId);
              const dept = departments.find((d) => d.id === course?.departmentId);
              const isFull = offering.enrolledCount >= offering.capacity;
              const isSelected = selectedOfferingId === offering.id;

              return (
                <div
                  key={offering.id}
                  className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                    isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-sm text-emerald-800">{course?.code}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isFull
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {offering.enrolledCount} / {offering.capacity} Enrolled
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{course?.title}</h3>
                    <p className="text-slate-500 text-xs mt-1">{dept?.name}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Section & Room:</span>
                        <span className="font-medium text-slate-800">{offering.section} · {offering.classroom}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Schedule:</span>
                        <span className="font-medium text-slate-800">{offering.scheduleDays}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Credits:</span>
                        <span className="font-medium font-mono text-slate-800">{course?.creditHours} Cr ({course?.lectureHours}L + {course?.labHours}P)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => exportClassRoster(offering)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      title="Download Class List"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Roster CSV</span>
                    </button>

                    {isStudent ? (
                      <button
                        onClick={() => {
                          setTargetOfferingId(offering.id);
                          setReqActionType('Add');
                          setShowAddDropModal(true);
                        }}
                        disabled={isFull}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs'
                        }`}
                      >
                        {isFull ? 'Capacity Full' : 'Request Add'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedOfferingId(isSelected ? null : offering.id)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        {isSelected ? 'Hide Details' : 'View Enrollment'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SubTab 2: University Course Catalog */}
      {activeSubTab === 'catalog' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Course Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Credit Hours</th>
                  <th className="px-4 py-3">Prerequisites</th>
                  <th className="px-4 py-3">Assessment Weights</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => {
                  const dept = departments.find((d) => d.id === c.departmentId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">{c.code}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        <div>{c.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{dept?.code}</td>
                      <td className="px-4 py-3.5 font-mono tabular-nums text-slate-900">
                        {c.creditHours} Cr ({c.lectureHours}L, {c.labHours}P)
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                        {c.prerequisites.length > 0 ? c.prerequisites.join(', ') : <span className="text-slate-400">None</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px] tabular-nums">
                        Q:{c.assessmentWeights.quizzes}% · A:{c.assessmentWeights.assignments}% · M:{c.assessmentWeights.midterm}% · F:{c.assessmentWeights.finalExam}%
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium text-[11px]">
                          Approved
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Add/Drop Petition Queue */}
      {activeSubTab === 'add_drop_queue' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Course Add/Drop Review Queue</h2>
              <p className="text-xs text-slate-500">
                Department Head and Registrar formal authorization workflow.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
              {pendingRequests.length} Pending Actions
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {enrollments
              .filter((e) => e.status.startsWith('Pending') || e.status === 'Approved' || e.status === 'Rejected' || e.status === 'Dropped')
              .map((enr) => {
                const st = students.find((s) => s.id === enr.studentId);
                const course = courses.find((c) => c.id === enr.courseId);
                const offering = offerings.find((o) => o.id === enr.offeringId);
                const isPending = enr.status === 'Pending Add' || enr.status === 'Pending Drop';

                return (
                  <div key={enr.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            enr.status === 'Pending Add'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : enr.status === 'Pending Drop'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : enr.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {enr.status}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{st?.studentId}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-900">{st?.fullName}</span>
                      </div>

                      <div className="text-slate-700 text-xs flex items-center gap-2 pt-0.5">
                        <span className="font-mono font-semibold text-emerald-800">{course?.code}</span>
                        <span>{course?.title} ({course?.creditHours} Cr)</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{offering?.section}</span>
                      </div>

                      {enr.requestReason && (
                        <p className="text-slate-500 text-[11px] bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                          <strong>Student Justification:</strong> {enr.requestReason}
                        </p>
                      )}

                      {enr.reviewNotes && (
                        <p className="text-emerald-800 text-[11px] mt-1">
                          <strong>Decision Note:</strong> {enr.reviewNotes} (by {enr.reviewedBy})
                        </p>
                      )}
                    </div>

                    {/* Actions for Dept Head / Registrar */}
                    {canApprove && isPending && (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                        <input
                          type="text"
                          placeholder="Review note..."
                          value={reviewNotes[enr.id] || ''}
                          onChange={(e) =>
                            setReviewNotes({ ...reviewNotes, [enr.id]: e.target.value })
                          }
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white w-40"
                        />
                        <button
                          onClick={() => handleReviewAction(enr.id, 'Approved')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReviewAction(enr.id, 'Rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition-colors shadow-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SubTab 4: Student's Registered Courses */}
      {activeSubTab === 'my_enrollments' && isStudent && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">My Registered Course Schedule</h2>
              <p className="text-xs text-slate-500">Student: {currentStudent.fullName} ({currentStudent.studentId})</p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Total Credits: {myEnrollments.reduce((acc, e) => acc + (courses.find((c) => c.id === e.courseId)?.creditHours || 0), 0)} Cr
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {myEnrollments.map((enr) => {
              const course = courses.find((c) => c.id === enr.courseId);
              const offering = offerings.find((o) => o.id === enr.offeringId);

              return (
                <div key={enr.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800">{course?.code}</span>
                      <span className="font-semibold text-slate-900">{course?.title}</span>
                      <span className="text-slate-500">({course?.creditHours} Cr)</span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2">
                      <span>Room: {offering?.classroom}</span>
                      <span>·</span>
                      <span>{offering?.scheduleDays}</span>
                      <span>·</span>
                      <span className="font-mono font-bold text-slate-700">Attendance: {enr.attendancePercentage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        enr.status === 'Approved' || enr.status === 'Registered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {enr.status}
                    </span>

                    {(enr.status === 'Approved' || enr.status === 'Registered') && (
                      <button
                        onClick={() => {
                          setTargetOfferingId(enr.offeringId);
                          setReqActionType('Drop');
                          setShowAddDropModal(true);
                        }}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-800 border border-rose-200 px-2.5 py-1 rounded-md hover:bg-rose-50 transition-colors"
                      >
                        Petition Drop
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Drop Request Modal for Students */}
      {showAddDropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight">
                Submit Course Add/Drop Petition
              </h2>
              <button onClick={() => setShowAddDropModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDropSubmit} className="p-6 space-y-4 text-xs">
              {modalFeedback && (
                <div
                  className={`p-3 rounded-lg border flex items-center gap-2 ${
                    modalFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {modalFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                  )}
                  <span>{modalFeedback.msg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Petition Action Type</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="reqType"
                      checked={reqActionType === 'Add'}
                      onChange={() => setReqActionType('Add')}
                    />
                    <span className="font-medium text-slate-800">Add Course to Schedule</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="reqType"
                      checked={reqActionType === 'Drop'}
                      onChange={() => setReqActionType('Drop')}
                    />
                    <span className="font-medium text-slate-800">Drop Existing Course</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Offering</label>
                <select
                  value={targetOfferingId}
                  onChange={(e) => setTargetOfferingId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {offerings.map((o) => {
                    const c = courses.find((course) => course.id === o.courseId);
                    return (
                      <option key={o.id} value={o.id}>
                        {c?.code} - {c?.title} ({o.section}) [{o.enrolledCount}/{o.capacity}]
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Academic Justification / Advisor Recommendation <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this adjustment is requested (e.g., prerequisite alignment, workload adjustment, medical rescheduling)..."
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDropModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  Submit Official Petition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Course Modal for Registrar / Dept Head */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight">Create & Register New Course</h2>
              <button onClick={() => setShowNewCourseModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AGRI3042"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Irrigation Structures & Flood Defense"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newCreditHours}
                    onChange={(e) => setNewCreditHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lecture Hrs/Wk</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={newLectureHours}
                    onChange={(e) => setNewLectureHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lab/Practical Hrs</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={newLabHours}
                    onChange={(e) => setNewLabHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Prerequisites (comma separated codes)
                </label>
                <input
                  type="text"
                  placeholder="e.g. COSC2011, MATH1011"
                  value={newPrereqs}
                  onChange={(e) => setNewPrereqs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Description & Syllabus</label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis of core competencies..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  Register Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
