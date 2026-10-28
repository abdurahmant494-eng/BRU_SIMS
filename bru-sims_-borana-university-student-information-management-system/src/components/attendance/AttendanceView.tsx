import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, CourseOffering } from '../../types';
import { t } from '../../utils/translations';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Save,
  Plus,
  Users,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    currentRole,
    currentUser,
    offerings,
    courses,
    students,
    enrollments,
    attendance,
    addAttendanceRecord,
    language,
  } = useApp();

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(offerings[0]?.id || '');
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionAttendance, setSessionAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Excused'>>({});

  const isStudent = currentRole === 'student';
  const isInstructor = currentRole === 'instructor';
  const canRecord = isInstructor || currentRole === 'department_head' || currentRole === 'admin';

  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId);
  const activeCourse = courses.find((c) => c.id === selectedOffering?.courseId);

  // Enrolled students in this offering
  const enrolledStudents = enrollments
    .filter((e) => e.offeringId === selectedOfferingId && (e.status === 'Approved' || e.status === 'Registered'))
    .map((e) => {
      const st = students.find((s) => s.id === e.studentId);
      return {
        ...e,
        student: st,
      };
    });

  // Past attendance records for this offering
  const offeringAttendance = attendance.filter((a) => a.offeringId === selectedOfferingId);

  const openNewSession = () => {
    const initialMap: Record<string, 'Present' | 'Absent' | 'Excused'> = {};
    enrolledStudents.forEach((item) => {
      if (item.student) initialMap[item.student.id] = 'Present';
    });
    setSessionAttendance(initialMap);
    setSessionTopic('');
    setShowNewSessionModal(true);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic.trim()) {
      alert('Please specify the lecture topic covered.');
      return;
    }

    const records = Object.entries(sessionAttendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    addAttendanceRecord(selectedOfferingId, sessionDate, sessionTopic.trim(), records);
    setShowNewSessionModal(false);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('attendance', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              75% Minimum Attendance Threshold Enforced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lecture session tracking, continuous presence verification, and examination qualification monitoring.
          </p>
        </div>

        {canRecord && (
          <button
            onClick={openNewSession}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Lecture Session</span>
          </button>
        )}
      </div>

      {/* Offering Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase">Select Course:</label>
          <select
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-800"
          >
            {offerings.map((o) => {
              const c = courses.find((course) => course.id === o.courseId);
              return (
                <option key={o.id} value={o.id}>
                  {c?.code} - {c?.title} ({o.section})
                </option>
              );
            })}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Total Lecture Sessions Logged: <strong className="text-slate-900 font-mono">{offeringAttendance.length}</strong>
        </div>
      </div>

      {/* Enrolled Students Attendance Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Student Attendance Standings</h2>
          <p className="text-xs text-slate-500">
            Senate Regulation: Students falling below 75% are ineligible to sit for final examinations without Academic Commission clearance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Full Legal Name</th>
                <th className="px-4 py-3">Degree Program</th>
                <th className="px-4 py-3 text-right">Attendance Rate</th>
                <th className="px-4 py-3 text-right">Exam Qualification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrolledStudents.map((item) => {
                const pct = item.attendancePercentage;
                const isWarning = pct < 75;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-800">{item.student?.studentId}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.student?.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.student?.program}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-sm tabular-nums">
                      <span className={isWarning ? 'text-rose-700' : 'text-emerald-700'}>{pct}%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isWarning
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isWarning ? 'Exam Barred (<75%)' : 'Qualified'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Lecture Sessions Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Recorded Lecture Log ({offeringAttendance.length} Sessions)
        </h2>
        <div className="space-y-2">
          {offeringAttendance.length === 0 ? (
            <p className="text-slate-400 text-xs">No lecture attendance sessions logged for this offering yet.</p>
          ) : (
            offeringAttendance.map((rec) => (
              <div key={rec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{rec.lectureTopic}</span>
                  <span className="font-mono text-slate-500 tabular-nums">{rec.date}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1">
                  <span>
                    Present:{' '}
                    <strong className="text-emerald-700">
                      {rec.records.filter((r) => r.status === 'Present').length}
                    </strong>
                  </span>
                  <span>
                    Absent:{' '}
                    <strong className="text-rose-700">
                      {rec.records.filter((r) => r.status === 'Absent').length}
                    </strong>
                  </span>
                  <span>
                    Excused:{' '}
                    <strong className="text-amber-700">
                      {rec.records.filter((r) => r.status === 'Excused').length}
                    </strong>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Record Attendance Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-tight">Log Lecture Attendance</h2>
                <p className="text-xs text-slate-300">{activeCourse?.code} - {activeCourse?.title}</p>
              </div>
              <button onClick={() => setShowNewSessionModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Session Date</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lecture Topic / Module</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 4: Memory Hierarchy"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">Student Roll Call</label>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg p-2">
                  {enrolledStudents.map((item) => {
                    const stId = item.student?.id || '';
                    const curr = sessionAttendance[stId] || 'Present';

                    return (
                      <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-slate-900 block">{item.student?.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.student?.studentId}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(['Present', 'Absent', 'Excused'] as const).map((stat) => (
                            <button
                              key={stat}
                              type="button"
                              onClick={() =>
                                setSessionAttendance({ ...sessionAttendance, [stId]: stat })
                              }
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                                curr === stat
                                  ? stat === 'Present'
                                    ? 'bg-emerald-700 text-white'
                                    : stat === 'Absent'
                                    ? 'bg-rose-700 text-white'
                                    : 'bg-amber-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {stat}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                >
                  Save Lecture Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
