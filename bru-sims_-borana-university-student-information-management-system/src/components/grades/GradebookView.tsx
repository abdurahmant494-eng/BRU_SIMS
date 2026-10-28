import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeRecord, ScoreBreakdown, CourseOffering } from '../../types';
import { calculateGrade, BORANA_UNIVERSITY_GRADING_SCALE } from '../../utils/gradeCalculations';
import { t } from '../../utils/translations';
import {
  Award,
  CheckCircle,
  Clock,
  Lock,
  Edit,
  Save,
  Send,
  ShieldCheck,
  FileText,
  AlertTriangle,
  History,
  X,
  Search,
} from 'lucide-react';

export const GradebookView: React.FC = () => {
  const {
    currentRole,
    currentUser,
    grades,
    courses,
    offerings,
    students,
    enrollments,
    language,
    saveGradeScores,
    submitGradesForReview,
    approveGradesByDeptHead,
    publishGradesByRegistrar,
  } = useApp();

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(offerings[0]?.id || '');
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editScores, setEditScores] = useState<ScoreBreakdown>({ quizzes: 0, assignments: 0, midterm: 0, finalExam: 0 });
  const [correctionReason, setCorrectionReason] = useState('');
  const [viewHistoryGrade, setViewHistoryGrade] = useState<GradeRecord | null>(null);

  const isStudent = currentRole === 'student';
  const isInstructor = currentRole === 'instructor';
  const isDeptHead = currentRole === 'department_head';
  const isRegistrar = currentRole === 'registrar';
  const isAdmin = currentRole === 'admin';

  // Active offering
  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId);
  const activeCourse = courses.find((c) => c.id === selectedOffering?.courseId);

  // Grades for current offering
  const currentOfferingGrades = grades.filter((g) => g.offeringId === selectedOfferingId);

  // Current student context
  const currentStudent = students.find((s) => s.id === (currentUser.associatedStudentId || 'stud-1')) || students[0];
  const myGrades = grades.filter((g) => g.studentId === currentStudent.id);

  // Offering workflow status
  const offeringGradeStatus = currentOfferingGrades[0]?.status || 'Draft';

  // Permission flags
  const canEditScores =
    (isInstructor && (offeringGradeStatus === 'Draft' || offeringGradeStatus === 'Submitted')) ||
    isAdmin ||
    (isRegistrar && offeringGradeStatus === 'Registrar_Published'); // Authorized correction

  const canSubmit = isInstructor && offeringGradeStatus === 'Draft';
  const canApprove = (isDeptHead || isAdmin) && offeringGradeStatus === 'Submitted';
  const canPublish = (isRegistrar || isAdmin) && offeringGradeStatus === 'Department_Approved';

  const handleStartEdit = (grade: GradeRecord) => {
    setEditingGradeId(grade.id);
    setEditScores({ ...grade.scores });
    setCorrectionReason('');
  };

  const handleSaveScore = (gradeId: string) => {
    // Validate score ranges according to course weights
    const weights = activeCourse?.assessmentWeights || { quizzes: 15, assignments: 15, midterm: 30, finalExam: 40 };

    if (
      editScores.quizzes > weights.quizzes ||
      editScores.assignments > weights.assignments ||
      editScores.midterm > weights.midterm ||
      editScores.finalExam > weights.finalExam
    ) {
      alert(`Scores exceed component weights (Quiz max: ${weights.quizzes}, Assignment max: ${weights.assignments}, Midterm max: ${weights.midterm}, Final Exam max: ${weights.finalExam})`);
      return;
    }

    saveGradeScores(gradeId, editScores, correctionReason || 'Continuous assessment score entry');
    setEditingGradeId(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isStudent ? 'My Grades & Assessment Scores' : t('gradebook', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Senate Grade Legislation Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard Borana University Continuous Assessment (CA) and Final Examination Gradebook.
          </p>
        </div>

        {/* Workflow Action Buttons */}
        {!isStudent && (
          <div className="flex items-center gap-2">
            {canSubmit && (
              <button
                onClick={() => submitGradesForReview(selectedOfferingId)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Dept Head</span>
              </button>
            )}

            {canApprove && (
              <button
                onClick={() => approveGradesByDeptHead(selectedOfferingId)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve Department Grades</span>
              </button>
            )}

            {canPublish && (
              <button
                onClick={() => publishGradesByRegistrar(selectedOfferingId)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Publish Official Grades</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* STUDENT VIEW */}
      {isStudent ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Official Course Grades & Mark Breakdown</h2>
                <p className="text-xs text-slate-500">Student: {currentStudent.fullName} ({currentStudent.studentId})</p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                CGPA: {currentStudent.cgpa.toFixed(2)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Course Code & Title</th>
                    <th className="px-4 py-3 text-right">Quizzes</th>
                    <th className="px-4 py-3 text-right">Assignments</th>
                    <th className="px-4 py-3 text-right">Midterm</th>
                    <th className="px-4 py-3 text-right">Final Exam</th>
                    <th className="px-4 py-3 text-right">Total Mark</th>
                    <th className="px-4 py-3 text-right">Letter Grade</th>
                    <th className="px-4 py-3 text-right">Grade Point</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myGrades.map((g) => {
                    const c = courses.find((course) => course.id === g.courseId);
                    const isPublished = g.status === 'Registrar_Published';

                    return (
                      <tr key={g.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-emerald-800">{c?.code}</span>
                          <span className="font-medium text-slate-900 ml-2">{c?.title}</span>
                          <span className="text-slate-400 text-[11px] block">{c?.creditHours} Credit Hours</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          {g.scores.quizzes} / {c?.assessmentWeights.quizzes}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          {g.scores.assignments} / {c?.assessmentWeights.assignments}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          {g.scores.midterm} / {c?.assessmentWeights.midterm}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          {g.scores.finalExam} / {c?.assessmentWeights.finalExam}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums text-slate-900 text-sm">
                          {g.totalMark.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-mono font-bold text-sm text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            {g.letterGrade}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {g.gradePoint.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isPublished
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isPublished ? 'Published' : 'In Approval'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* INSTRUCTOR / REGISTRAR / DEPT HEAD VIEW */
        <div className="space-y-4">
          {/* Offering Selector & Workflow Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Course Offering:
              </label>
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-800"
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

            {/* Workflow Progress Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Workflow Status:</span>
              <span
                className={`font-mono font-bold px-2.5 py-1 rounded text-xs ${
                  offeringGradeStatus === 'Registrar_Published'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : offeringGradeStatus === 'Department_Approved'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : offeringGradeStatus === 'Submitted'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {offeringGradeStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Assessment Formula Notice */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-800">Approved Weighting:</span> Quizzes (
              {activeCourse?.assessmentWeights.quizzes}%) · Assignments ({activeCourse?.assessmentWeights.assignments}%) · Midterm ({activeCourse?.assessmentWeights.midterm}%) · Final Examination ({activeCourse?.assessmentWeights.finalExam}%) = 100%
            </div>
            <div className="text-[11px] text-slate-500">
              Formula: Auto-aggregates and determines Borana Senate Letter Grade
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3 text-right">Quizzes ({activeCourse?.assessmentWeights.quizzes})</th>
                    <th className="px-4 py-3 text-right">Assignments ({activeCourse?.assessmentWeights.assignments})</th>
                    <th className="px-4 py-3 text-right">Midterm ({activeCourse?.assessmentWeights.midterm})</th>
                    <th className="px-4 py-3 text-right">Final ({activeCourse?.assessmentWeights.finalExam})</th>
                    <th className="px-4 py-3 text-right">Total (100)</th>
                    <th className="px-4 py-3 text-right">Grade</th>
                    <th className="px-4 py-3 text-right">GP</th>
                    <th className="px-4 py-3 text-right">History</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentOfferingGrades.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                        No continuous assessment scores logged for this offering yet.
                      </td>
                    </tr>
                  ) : (
                    currentOfferingGrades.map((g) => {
                      const st = students.find((s) => s.id === g.studentId);
                      const isEditing = editingGradeId === g.id;

                      if (isEditing) {
                        return (
                          <tr key={g.id} className="bg-amber-50/60">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">{st?.studentId}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{st?.fullName}</td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={activeCourse?.assessmentWeights.quizzes || 15}
                                value={editScores.quizzes}
                                onChange={(e) => setEditScores({ ...editScores, quizzes: Number(e.target.value) })}
                                className="w-16 px-1.5 py-1 text-right border border-slate-300 rounded bg-white text-xs font-mono"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={activeCourse?.assessmentWeights.assignments || 15}
                                value={editScores.assignments}
                                onChange={(e) => setEditScores({ ...editScores, assignments: Number(e.target.value) })}
                                className="w-16 px-1.5 py-1 text-right border border-slate-300 rounded bg-white text-xs font-mono"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={activeCourse?.assessmentWeights.midterm || 30}
                                value={editScores.midterm}
                                onChange={(e) => setEditScores({ ...editScores, midterm: Number(e.target.value) })}
                                className="w-16 px-1.5 py-1 text-right border border-slate-300 rounded bg-white text-xs font-mono"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={activeCourse?.assessmentWeights.finalExam || 40}
                                value={editScores.finalExam}
                                onChange={(e) => setEditScores({ ...editScores, finalExam: Number(e.target.value) })}
                                className="w-16 px-1.5 py-1 text-right border border-slate-300 rounded bg-white text-xs font-mono"
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                              {(editScores.quizzes + editScores.assignments + editScores.midterm + editScores.finalExam).toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                              {calculateGrade(editScores.quizzes + editScores.assignments + editScores.midterm + editScores.finalExam).letterGrade}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-600">
                              {calculateGrade(editScores.quizzes + editScores.assignments + editScores.midterm + editScores.finalExam).gradePoint.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right" colSpan={2}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleSaveScore(g.id)}
                                  className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingGradeId(null)}
                                  className="px-2 py-1 text-slate-600 hover:text-slate-800 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={g.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono font-bold text-emerald-800">{st?.studentId}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{st?.fullName}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{g.scores.quizzes}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{g.scores.assignments}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{g.scores.midterm}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{g.scores.finalExam}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-slate-900 text-sm">
                            {g.totalMark.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono font-bold text-sm text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                              {g.letterGrade}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                            {g.gradePoint.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {g.changeHistory.length > 0 ? (
                              <button
                                onClick={() => setViewHistoryGrade(g)}
                                className="text-blue-700 hover:underline flex items-center gap-1 ml-auto text-[11px]"
                              >
                                <History className="w-3 h-3" />
                                <span>{g.changeHistory.length} logs</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Original</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {canEditScores ? (
                              <button
                                onClick={() => handleStartEdit(g)}
                                className="px-2 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded"
                              >
                                Edit Marks
                              </button>
                            ) : (
                              <span className="text-slate-400 flex items-center justify-end gap-1 text-[11px]">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grade Change History Modal */}
      {viewHistoryGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-tight">Grade Change Audit Trail</h2>
                <p className="text-xs text-slate-300">
                  Student: {students.find((s) => s.id === viewHistoryGrade.studentId)?.fullName}
                </p>
              </div>
              <button onClick={() => setViewHistoryGrade(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs max-h-96 overflow-y-auto">
              {viewHistoryGrade.changeHistory.map((ch, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">{ch.changedBy}</span>
                    <span className="font-mono text-slate-500 tabular-nums">{ch.date}</span>
                  </div>
                  <div className="text-slate-700 flex items-center gap-2">
                    <span>
                      Changed from <strong className="text-slate-900">{ch.oldTotal}% ({ch.oldGrade})</strong>
                    </span>
                    <span>→</span>
                    <span>
                      To <strong className="text-emerald-700">{ch.newTotal}% ({ch.newGrade})</strong>
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]"><strong>Official Reason:</strong> {ch.reason}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setViewHistoryGrade(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
