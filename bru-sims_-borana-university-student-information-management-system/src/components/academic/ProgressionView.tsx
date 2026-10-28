import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateAcademicStanding, evaluateGraduationEligibility } from '../../utils/gradeCalculations';
import { t } from '../../utils/translations';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const ProgressionView: React.FC = () => {
  const {
    students,
    courses,
    grades,
    departments,
    currentRole,
    currentUser,
    language,
    calendarConfig,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'honors' | 'support' | 'grad_ready'>('all');
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const isStudent = currentRole === 'student';
  const isParent = currentRole === 'parent';

  // Target student for student or parent persona
  const targetStudentId = currentUser.associatedStudentId || 'stud-1';
  const activeStudent = students.find((s) => s.id === targetStudentId) || students[0];

  // Student specific progression
  const studentGrades = grades.filter((g) => g.studentId === activeStudent?.id);
  const studentStanding = evaluateAcademicStanding(activeStudent?.cgpa || 0);
  const studentGradCheck = evaluateGraduationEligibility({
    cgpa: activeStudent?.cgpa || 0,
    creditsEarned: activeStudent?.totalCreditsEarned || 0,
    requiredCredits: 140,
    hasFailingGrade: studentGrades.some((g) => g.letterGrade === 'F'),
    hasIncomplete: studentGrades.some((g) => g.status !== 'Registrar_Published'),
  });

  // Institutional cohorts
  const activeStudents = students.filter((s) => !s.isArchived);

  const honorsStudents = activeStudents.filter((s) => s.cgpa >= 3.5);
  const supportStudents = activeStudents.filter((s) => s.cgpa < 2.0);
  const gradReadyStudents = activeStudents.filter((s) => s.yearOfStudy >= 4 && s.cgpa >= 2.0);

  const displayedStudents = activeStudents.filter((s) => {
    if (activeCategory === 'honors' && s.cgpa < 3.5) return false;
    if (activeCategory === 'support' && s.cgpa >= 2.0) return false;
    if (activeCategory === 'grad_ready' && (s.yearOfStudy < 4 || s.cgpa < 2.0)) return false;

    if (selectedDeptId !== 'ALL' && s.departmentId !== selectedDeptId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isStudent || isParent ? 'Academic Performance & Degree Audit' : t('progression', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Borana Senate Academic Regulations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official GPA/CGPA computation, academic progression tracking, Dean\'s honor roll, and graduation clearance.
          </p>
        </div>
      </div>

      {/* STUDENT / PARENT VIEW */}
      {isStudent || isParent ? (
        <div className="space-y-6">
          {/* Degree Audit Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative CGPA</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-mono text-emerald-700 tabular-nums">
                  {activeStudent.cgpa.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">/ 4.00</span>
              </div>
              <p className="text-xs text-emerald-600 mt-2 font-medium">{studentStanding.standingLabel}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credits Earned</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                  {activeStudent.totalCreditsEarned}
                </span>
                <span className="text-xs text-slate-400">of 140 req.</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {Math.round((activeStudent.totalCreditsEarned / 140) * 100)}% of degree coursework completed
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Standing</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-bold text-slate-900">{activeStudent.academicStatus}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Year {activeStudent.yearOfStudy} · Semester {activeStudent.currentSemester}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Graduation Readiness</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-base font-bold ${studentGradCheck.eligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {studentGradCheck.eligible ? 'Eligible for Clearance' : 'In Progress'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Expected Class: {studentGradCheck.classification}</p>
            </div>
          </div>

          {/* Academic Progression Progress Bar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Undergraduate Degree Completion Progress</span>
              <span className="font-mono font-bold text-emerald-800">
                {activeStudent.totalCreditsEarned} / 140 Credit Hours
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (activeStudent.totalCreditsEarned / 140) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Year 1: Freshman Core (Completed)</span>
              <span>Year 2: Major Foundation (Completed)</span>
              <span>Year 3: Advanced Studies (Current)</span>
              <span>Year 4: Senior Project & Internship</span>
            </div>
          </div>

          {/* Graduation Clearance Checklist */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Institutional Senate Graduation Checklist</span>
            </h2>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Minimum CGPA Standard (&ge; 2.00)</span>
                  <span className="text-slate-500 block text-[11px]">Cumulative Grade Point Average</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-700">{activeStudent.cgpa.toFixed(2)}</span>
                  {activeStudent.cgpa >= 2.0 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Credit Hour Completion Requirement (140 Credits)</span>
                  <span className="text-slate-500 block text-[11px]">Accredited departmental curriculum</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800">{activeStudent.totalCreditsEarned} / 140</span>
                  {activeStudent.totalCreditsEarned >= 140 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      In Progress
                    </span>
                  )}
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">No Un-cleared Failing (F) Grades</span>
                  <span className="text-slate-500 block text-[11px]">All mandatory core courses passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-700">0 Active Fs</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Academic Integrity & Disciplinary Clearance</span>
                  <span className="text-slate-500 block text-[11px]">Office of the Dean of Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold">Cleared</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* INSTITUTIONAL COHORT MANAGEMENT VIEW */
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeCategory === 'all'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">All Active Cohorts</span>
                <Users className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {activeStudents.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Full undergraduate enrollment</p>
            </button>

            <button
              onClick={() => setActiveCategory('honors')}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeCategory === 'honors'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase">Dean's Honor Roll</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-800 tabular-nums">
                {honorsStudents.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">CGPA &ge; 3.50 (Distinction)</p>
            </button>

            <button
              onClick={() => setActiveCategory('support')}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeCategory === 'support'
                  ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase">Academic Support Needed</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-amber-700 tabular-nums">
                {supportStudents.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">CGPA &lt; 2.00 (Warning / Probation)</p>
            </button>

            <button
              onClick={() => setActiveCategory('grad_ready')}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeCategory === 'grad_ready'
                  ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 uppercase">Graduation Candidates</span>
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-purple-700 tabular-nums">
                {gradReadyStudents.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Year 4+ in Good Standing</p>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Degree Program</th>
                    <th className="px-4 py-3">Year of Study</th>
                    <th className="px-4 py-3 text-right">Credits Earned</th>
                    <th className="px-4 py-3 text-right">CGPA</th>
                    <th className="px-4 py-3">Standing Evaluation</th>
                    <th className="px-4 py-3 text-right">Intervention / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedStudents.map((st) => {
                    const standing = evaluateAcademicStanding(st.cgpa);

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">{st.studentId}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{st.fullName}</td>
                        <td className="px-4 py-3.5 text-slate-700">{st.program}</td>
                        <td className="px-4 py-3.5 text-slate-700 font-mono">Year {st.yearOfStudy} · Sem {st.currentSemester}</td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-800">
                          {st.totalCreditsEarned} Cr
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums text-sm">
                          {st.cgpa > 0 ? st.cgpa.toFixed(2) : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              st.cgpa >= 3.5
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : st.cgpa >= 2.0
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {standing.standingLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {standing.supportNeeded ? (
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Assigned Faculty Counseling
                            </span>
                          ) : st.cgpa >= 3.8 ? (
                            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              Dean's List Awardee
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Normal Progression</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
