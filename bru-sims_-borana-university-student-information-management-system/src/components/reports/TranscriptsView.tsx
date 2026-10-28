import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { evaluateAcademicStanding } from '../../utils/gradeCalculations';
import { t } from '../../utils/translations';
import {
  Printer,
  Download,
  Search,
  CheckCircle,
  FileText,
  Building,
  Award,
  ChevronDown,
} from 'lucide-react';

export const TranscriptsView: React.FC = () => {
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

  const isStudent = currentRole === 'student';
  const defaultStudentId = isStudent ? (currentUser.associatedStudentId || 'stud-1') : 'stud-1';
  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudentId);

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const dept = departments.find((d) => d.id === activeStudent?.departmentId);

  // Student grades
  const studentGrades = grades.filter((g) => g.studentId === activeStudent?.id);

  // Group by semester
  const semestersGrouped: Record<number, typeof studentGrades> = {};
  studentGrades.forEach((g) => {
    if (!semestersGrouped[g.semester]) {
      semestersGrouped[g.semester] = [];
    }
    semestersGrouped[g.semester].push(g);
  });

  const standing = evaluateAcademicStanding(activeStudent?.cgpa || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Course Code', 'Course Title', 'Credit Hours', 'Letter Grade', 'Grade Point', 'Semester', 'Academic Year'];
    const rows = studentGrades.map((g) => {
      const c = courses.find((course) => course.id === g.courseId);
      return [
        `"${c?.code || 'N/A'}"`,
        `"${c?.title || 'N/A'}"`,
        c?.creditHours || 3,
        g.letterGrade,
        g.gradePoint.toFixed(2),
        g.semester,
        `"${g.academicYear}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`"Borana University - Academic Transcript for ${activeStudent.fullName} (${activeStudent.studentId})"`, '', headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transcript_${activeStudent.studentId.replace(/\//g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('transcripts', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Registrar Verified Document
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Borana University Student Academic Record, semester progression, and transcript generator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isStudent && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Select Student:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.studentId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('printTranscript', language)}</span>
          </button>
        </div>
      </div>

      {/* Official Academic Transcript Document Card */}
      <div className="transcript-card bg-white rounded-xl border border-slate-300 shadow-md p-6 sm:p-10 max-w-4xl mx-auto space-y-6 text-slate-900 relative">
        {/* Institutional Header */}
        <div className="text-center space-y-1.5 border-b-2 border-emerald-950 pb-5">
          <div className="flex justify-center mb-2">
            <img
              src="/src/assets/images/bru_university_crest_1793125542443.jpg"
              alt="Borana University Seal"
              className="w-20 h-20 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 uppercase font-serif">
            BORANA UNIVERSITY
          </h2>
          <p className="text-[11px] font-semibold tracking-wider text-emerald-800 uppercase italic">
            "Dedicated to Resilient Pastoral Future"
          </p>
          <h3 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-700 uppercase">
            Office of the University Registrar
          </h3>
          <p className="text-[11px] text-slate-500">
            P.O. Box 244, Yabello Main Campus, Borana Zone, Oromia, Ethiopia · Web: www.bru.edu.et · Email: registar@bru.edu.et
          </p>
          <div className="pt-2">
            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-widest bg-emerald-900 text-white rounded">
              OFFICIAL STUDENT ACADEMIC TRANSCRIPT
            </span>
          </div>
        </div>

        {/* Student Biodata Information Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-xs bg-slate-50/70 p-4 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">Student Full Name</span>
            <span className="font-bold text-slate-900 text-sm">{activeStudent.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">Student ID Number</span>
            <span className="font-bold font-mono text-emerald-800 text-sm">{activeStudent.studentId}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">National ID Number</span>
            <span className="font-bold font-mono text-slate-900">{activeStudent.nationalId}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">Gender / Birth Date</span>
            <span className="font-medium text-slate-900">{activeStudent.gender} · {activeStudent.birthDate}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">College / Faculty</span>
            <span className="font-medium text-slate-900">{dept?.faculty || 'Institute of Technology'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">Academic Department</span>
            <span className="font-semibold text-slate-900">{dept?.name}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">Program of Study</span>
            <span className="font-semibold text-slate-900">{activeStudent.program}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">Medium of Instruction</span>
            <span className="font-medium text-slate-900">English</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block uppercase">Admission Year / Status</span>
            <span className="font-mono text-slate-900 font-semibold">{activeStudent.admissionYear} · {activeStudent.academicStatus}</span>
          </div>
        </div>

        {/* Coursework and Grade Records Table */}
        <div className="space-y-4">
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">Course Code</th>
                  <th className="px-3 py-2">Course Title</th>
                  <th className="px-3 py-2 text-right">Credit Hrs</th>
                  <th className="px-3 py-2 text-right">Letter Grade</th>
                  <th className="px-3 py-2 text-right">Grade Point</th>
                  <th className="px-3 py-2 text-right">Quality Points</th>
                  <th className="px-3 py-2 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentGrades.map((g) => {
                  const course = courses.find((c) => c.id === g.courseId);
                  const credit = course?.creditHours || 3;
                  const qPoints = (credit * g.gradePoint).toFixed(2);

                  return (
                    <tr key={g.id}>
                      <td className="px-3 py-2 font-mono font-bold text-slate-900">{course?.code}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">{course?.title}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">{credit}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">{g.letterGrade}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">{g.gradePoint.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold">{qPoints}</td>
                      <td className="px-3 py-2 text-right text-emerald-800 font-medium text-[11px]">
                        {g.gradePoint >= 2.0 ? 'PASSED' : 'DEFICIT'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Performance Summary Box */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px] block font-semibold">Total Credits Completed</span>
            <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
              {activeStudent.totalCreditsEarned}
            </span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block font-semibold">Semester GPA (SGPA)</span>
            <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
              {activeStudent.cgpa.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block font-semibold">Cumulative CGPA</span>
            <span className="font-mono font-bold text-base text-emerald-800 tabular-nums">
              {activeStudent.cgpa.toFixed(2)} / 4.00
            </span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block font-semibold">Academic Standing</span>
            <span className="font-bold text-xs text-slate-900 block truncate">{standing.standingLabel}</span>
          </div>
        </div>

        {/* Borana University Grading Legend */}
        <div className="text-[10px] text-slate-600 border border-slate-200 p-3 rounded space-y-1">
          <div className="font-bold text-slate-800 uppercase tracking-wider">
            Borana University Senate Approved Grading Scale:
          </div>
          <p className="leading-relaxed">
            A+ [90-100] = 4.00 · A [85-89] = 4.00 · A- [80-84] = 3.75 · B+ [75-79] = 3.50 · B [70-74] = 3.00 · B- [65-69] = 2.75 · C+ [60-64] = 2.50 · C [50-59] = 2.00 (Min. Passing Grade) · C- [45-49] = 1.50 · D [40-44] = 1.00 · F [&lt;40] = 0.00. Minimum CGPA for graduation is 2.00.
          </p>
        </div>

        {/* Verification, Watermark, and Signatures */}
        <div className="pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 block text-[10px]">Date of Issue:</span>
            <span className="font-mono font-semibold text-slate-900">
              {new Date().toISOString().split('T')[0]}
            </span>
            <div className="pt-2">
              <span className="text-[9px] text-slate-400 block font-mono">
                Verification Hash: BRU-{activeStudent.id}-{Date.now().toString(36).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center p-2 mb-1">
              <span className="text-[9px] font-bold text-emerald-900 uppercase text-center leading-tight">
                OFFICIAL REGISTRAR SEAL
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Not valid without official embossed seal</span>
          </div>

          <div className="text-right space-y-1">
            <div className="h-8 border-b border-slate-400 w-44 ml-auto mb-1 flex items-end justify-center font-serif italic text-slate-600">
              Wario Galma
            </div>
            <span className="font-bold text-slate-900 block">Mr. Wario Galma</span>
            <span className="text-[10px] text-slate-500 block">Director, University Registrar Office</span>
          </div>
        </div>
      </div>
    </div>
  );
};
