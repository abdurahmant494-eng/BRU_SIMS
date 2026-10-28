import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicCalendarConfig } from '../../types';
import { t } from '../../utils/translations';
import { generateBruSisMySQLDump } from '../../utils/sqlExport';
import {
  Settings,
  Database,
  Download,
  Upload,
  Calendar,
  Users,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Lock,
  RotateCcw,
  Shield,
  Server,
  Code,
  Copy,
  Terminal,
  ExternalLink,
  Table,
  Check,
  ChevronRight,
  ChevronDown,
  Layers,
  Clock,
} from 'lucide-react';

export const SystemAdminView: React.FC = () => {
  const {
    calendarConfig,
    updateCalendarConfig,
    backups,
    createBackupSnapshot,
    restoreFromSnapshot,
    bulkImportStudents,
    users,
    departments,
    courses,
    offerings,
    students,
    enrollments,
    grades,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'database_structure' | 'calendar' | 'backups' | 'bulk_import' | 'users'>('database_structure');

  // Calendar form
  const [academicYear, setAcademicYear] = useState(calendarConfig.academicYear);
  const [currentSemester, setCurrentSemester] = useState(calendarConfig.currentSemester);
  const [addDropDeadline, setAddDropDeadline] = useState(calendarConfig.addDropDeadline);
  const [gradeDeadline, setGradeDeadline] = useState(calendarConfig.gradeSubmissionDeadline);
  const [maxCredits, setMaxCredits] = useState(calendarConfig.maxCreditHoursAllowed);
  const [probationThreshold, setProbationThreshold] = useState(calendarConfig.academicProbationThreshold);
  const [calSavedNotice, setCalSavedNotice] = useState(false);

  // Bulk Import state
  const [csvText, setCsvText] = useState(
`BRU/UG/2026/0501,ETH-OR-BOR-12345,Korme Sora Wako,Male,2005-03-12,+251 91 223 3445,korme.sora@student.bru.edu.et,Yabello,Borana Zone,dept-cs,B.Sc. in Computer Science,1,1
BRU/UG/2026/0502,ETH-OR-BOR-12346,Elema Guyo Liban,Female,2005-08-20,+251 92 334 4556,elema.guyo@student.bru.edu.et,Moyale,Borana Zone,dept-agr,B.Sc. in Dryland Agriculture & Pastoral Studies,1,1`
  );
  const [importResults, setImportResults] = useState<{ successCount: number; errors: string[] } | null>(null);

  // Restore state
  const [restoreJson, setRestoreJson] = useState('');
  const [restoreFeedback, setRestoreFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // SQL & Database state
  const [dbSubTab, setDbSubTab] = useState<'tables' | 'views' | 'procedures' | 'triggers' | 'sql_console'>('tables');
  const [activeViewName, setActiveViewName] = useState('vw_dean_honor_roll');
  const [copiedSql, setCopiedSql] = useState(false);
  const [selectedDbTable, setSelectedDbTable] = useState<string | null>('students');
  const [sqlQuery, setSqlQuery] = useState('SELECT student_id, full_name, cgpa, academic_status FROM students ORDER BY cgpa DESC LIMIT 5;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Database Tables Definition matching MySQL phpMyAdmin bru_sis
  const dbTables = [
    {
      name: 'students',
      label: 'Students Registry',
      rows: students.length,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      size: `${(students.length * 1.8).toFixed(1)} KB`,
      columns: [
        { field: 'id', type: 'VARCHAR(50)', null: 'NO', key: 'PRI', default: 'NULL' },
        { field: 'student_id', type: 'VARCHAR(50)', null: 'NO', key: 'UNI', default: 'NULL' },
        { field: 'national_id', type: 'VARCHAR(50)', null: 'YES', key: '', default: 'NULL' },
        { field: 'full_name', type: 'VARCHAR(255)', null: 'NO', key: '', default: 'NULL' },
        { field: 'gender', type: "ENUM('Male','Female')", null: 'NO', key: '', default: 'NULL' },
        { field: 'birth_date', type: 'DATE', null: 'NO', key: '', default: 'NULL' },
        { field: 'phone', type: 'VARCHAR(50)', null: 'YES', key: '', default: 'NULL' },
        { field: 'email', type: 'VARCHAR(100)', null: 'YES', key: '', default: 'NULL' },
        { field: 'department_id', type: 'VARCHAR(50)', null: 'NO', key: 'MUL', default: 'NULL' },
        { field: 'program', type: 'VARCHAR(255)', null: 'NO', key: '', default: 'NULL' },
        { field: 'year_of_study', type: 'INT(11)', null: 'NO', key: '', default: '1' },
        { field: 'current_semester', type: 'INT(11)', null: 'NO', key: '', default: '1' },
        { field: 'academic_status', type: 'ENUM(...)', null: 'NO', key: '', default: "'Active'" },
        { field: 'cgpa', type: 'DECIMAL(4,2)', null: 'NO', key: '', default: '0.00' },
        { field: 'total_credits_earned', type: 'INT(11)', null: 'NO', key: '', default: '0' },
      ],
    },
    {
      name: 'departments',
      label: 'Colleges & Academic Units',
      rows: departments.length,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      size: `${(departments.length * 1.2).toFixed(1)} KB`,
      columns: [
        { field: 'id', type: 'VARCHAR(50)', null: 'NO', key: 'PRI', default: 'NULL' },
        { field: 'code', type: 'VARCHAR(20)', null: 'NO', key: 'UNI', default: 'NULL' },
        { field: 'name', type: 'VARCHAR(255)', null: 'NO', key: '', default: 'NULL' },
        { field: 'faculty', type: 'VARCHAR(255)', null: 'NO', key: '', default: 'NULL' },
        { field: 'office_location', type: 'VARCHAR(255)', null: 'YES', key: '', default: 'NULL' },
        { field: 'contact_email', type: 'VARCHAR(100)', null: 'YES', key: '', default: 'NULL' },
      ],
    },
    {
      name: 'courses',
      label: 'Curriculum Course Catalog',
      rows: courses.length,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      size: `${(courses.length * 1.5).toFixed(1)} KB`,
      columns: [
        { field: 'id', type: 'VARCHAR(50)', null: 'NO', key: 'PRI', default: 'NULL' },
        { field: 'code', type: 'VARCHAR(20)', null: 'NO', key: 'UNI', default: 'NULL' },
        { field: 'title', type: 'VARCHAR(255)', null: 'NO', key: '', default: 'NULL' },
        { field: 'credit_hours', type: 'INT(11)', null: 'NO', key: '', default: '3' },
        { field: 'department_id', type: 'VARCHAR(50)', null: 'NO', key: 'MUL', default: 'NULL' },
        { field: 'weight_quizzes', type: 'DECIMAL(5,2)', null: 'NO', key: '', default: '15.00' },
        { field: 'weight_assignments', type: 'DECIMAL(5,2)', null: 'NO', key: '', default: '15.00' },
        { field: 'weight_midterm', type: 'DECIMAL(5,2)', null: 'NO', key: '', default: '30.00' },
        { field: 'weight_final', type: 'DECIMAL(5,2)', null: 'NO', key: '', default: '40.00' },
      ],
    },
    {
      name: 'course_offerings',
      label: 'Semester Course Sections',
      rows: offerings.length,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      size: `${(offerings.length * 1.4).toFixed(1)} KB`,
      columns: [
        { field: 'id', type: 'VARCHAR(50)', null: 'NO', key: 'PRI', default: 'NULL' },
        { field: 'course_id', type: 'VARCHAR(50)', null: 'NO', key: 'MUL', default: 'NULL' },
        { field: 'academic_year', type: 'VARCHAR(20)', null: 'NO', key: '', default: 'NULL' },
        { field: 'semester', type: 'INT(11)', null: 'NO', key: '', default: '1' },
        { field: 'section', type: 'VARCHAR(50)', null: 'NO', key: '', default: 'NULL' },
        { field: 'instructor_id', type: 'VARCHAR(50)', null: 'YES', key: '', default: 'NULL' },
        { field: 'capacity', type: 'INT(11)', null: 'NO', key: '', default: '40' },
        { field: 'enrolled_count', type: 'INT(11)', null: 'NO', key: '', default: '0' },
        { field: 'classroom', type: 'VARCHAR(100)', null: 'YES', key: '', default: 'NULL' },
      ],
    },
    {
      name: 'course_enrollments',
      label: 'Student Course Registrations',
      rows: enrollments.length,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      size: `${(enrollments.length * 1.6).toFixed(1)} KB`,
      columns: [
        { field: 'id', type: 'VARCHAR(50)', null: 'NO', key: 'PRI', default: 'NULL' },
        { field: 'student_id', type: 'VARCHAR(50)', null: 'NO', key: 'MUL', default: 'NULL' },
        { field: 'offering_id', type: 'VARCHAR(50)', null: 'NO', key: 'MUL', default: 'NULL' },
        { field: 'status', type: 'ENUM(...)', null: 'NO', key: '', default: "'Approved'" },
        { field: 'attendance_percentage', type: 'INT(11)', null: 'NO', key: '', default: '100' },
      ],
    },
    {
      name: 'grade_records',
      label: 'Senate Continuous Assessments & Grades',
      rows: grades.length,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      size: `${(grades.length * 2.1).toFixed(1)} KB`,
      columns: [
        { field: 'id', type: 'VARCHAR(50)', null: 'NO', key: 'PRI', default: 'NULL' },
        { field: 'student_id', type: 'VARCHAR(50)', null: 'NO', key: 'MUL', default: 'NULL' },
        { field: 'course_id', type: 'VARCHAR(50)', null: 'NO', key: 'MUL', default: 'NULL' },
        { field: 'total_mark', type: 'DECIMAL(5,2)', null: 'NO', key: '', default: '0.00' },
        { field: 'letter_grade', type: 'VARCHAR(5)', null: 'NO', key: '', default: "'F'" },
        { field: 'grade_point', type: 'DECIMAL(4,2)', null: 'NO', key: '', default: '0.00' },
        { field: 'status', type: 'ENUM(...)', null: 'NO', key: '', default: "'Draft'" },
      ],
    },
    {
      name: 'users',
      label: 'Institutional Accounts & RBAC',
      rows: users.length,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      size: `${(users.length * 1.1).toFixed(1)} KB`,
      columns: [
        { field: 'id', type: 'VARCHAR(50)', null: 'NO', key: 'PRI', default: 'NULL' },
        { field: 'username', type: 'VARCHAR(100)', null: 'NO', key: 'UNI', default: 'NULL' },
        { field: 'full_name', type: 'VARCHAR(255)', null: 'NO', key: '', default: 'NULL' },
        { field: 'email', type: 'VARCHAR(100)', null: 'NO', key: 'UNI', default: 'NULL' },
        { field: 'role', type: 'ENUM(...)', null: 'NO', key: '', default: "'student'" },
      ],
    },
    {
      name: 'academic_calendar',
      label: 'Academic Session Regulations',
      rows: 1,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      size: '1.0 KB',
      columns: [
        { field: 'id', type: 'INT(11)', null: 'NO', key: 'PRI', default: 'NULL' },
        { field: 'academic_year', type: 'VARCHAR(20)', null: 'NO', key: '', default: 'NULL' },
        { field: 'current_semester', type: 'INT(11)', null: 'NO', key: '', default: '1' },
        { field: 'add_drop_deadline', type: 'DATE', null: 'NO', key: '', default: 'NULL' },
        { field: 'grade_submission_deadline', type: 'DATE', null: 'NO', key: '', default: 'NULL' },
      ],
    },
  ];

  const handleDownloadSqlDump = () => {
    const sql = generateBruSisMySQLDump({
      departments,
      courses,
      offerings,
      students,
      enrollments,
      grades,
      users,
      calendarConfig,
    });

    const blob = new Blob([sql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bru_sis.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySqlDump = () => {
    const sql = generateBruSisMySQLDump({
      departments,
      courses,
      offerings,
      students,
      enrollments,
      grades,
      users,
      calendarConfig,
    });
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleRunQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryError(null);
    setQueryResult(null);

    const q = sqlQuery.trim().toLowerCase();
    if (q.includes('from students')) {
      setQueryResult(
        students.slice(0, 5).map((s) => ({
          student_id: s.studentId,
          full_name: s.fullName,
          program: s.program,
          cgpa: s.cgpa.toFixed(2),
          status: s.academicStatus,
        }))
      );
    } else if (q.includes('from courses')) {
      setQueryResult(
        courses.slice(0, 5).map((c) => ({
          code: c.code,
          title: c.title,
          credit_hours: c.creditHours,
          department_id: c.departmentId,
        }))
      );
    } else if (q.includes('from grade_records') || q.includes('from grades')) {
      setQueryResult(
        grades.slice(0, 5).map((g) => ({
          student_id: g.studentId,
          course_id: g.courseId,
          total_mark: g.totalMark,
          letter_grade: g.letterGrade,
          grade_point: g.gradePoint,
          status: g.status,
        }))
      );
    } else {
      setQueryResult(
        students.slice(0, 5).map((s) => ({
          student_id: s.studentId,
          full_name: s.fullName,
          cgpa: s.cgpa.toFixed(2),
          academic_status: s.academicStatus,
        }))
      );
    }
  };

  const handleCalendarSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCalendarConfig({
      academicYear,
      currentSemester: Number(currentSemester),
      addDropDeadline,
      gradeSubmissionDeadline: gradeDeadline,
      maxCreditHoursAllowed: Number(maxCredits),
      academicProbationThreshold: Number(probationThreshold),
    });
    setCalSavedNotice(true);
    setTimeout(() => setCalSavedNotice(false), 2500);
  };

  const handleBulkImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportResults(null);

    const lines = csvText.trim().split('\n');
    const parsedStudents: any[] = [];

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 4) {
        parsedStudents.push({
          studentId: parts[0],
          nationalId: parts[1],
          fullName: parts[2],
          gender: parts[3] === 'Female' ? 'Female' : 'Male',
          birthDate: parts[4] || '2005-01-01',
          phone: parts[5] || '+251 91 000 0000',
          email: parts[6] || '',
          address: parts[7] || 'Borana Zone',
          woredaZone: parts[8] || 'Borana Zone, Oromia',
          departmentId: parts[9] || 'dept-cs',
          program: parts[10] || 'Undergraduate Degree',
          yearOfStudy: Number(parts[11]) || 1,
          currentSemester: Number(parts[12]) || 1,
        });
      }
    });

    const res = bulkImportStudents(parsedStudents);
    setImportResults(res);
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreFeedback(null);
    try {
      const parsed = JSON.parse(restoreJson);
      const res = restoreFromSnapshot(parsed);
      if (res.success) {
        setRestoreFeedback({ type: 'success', msg: res.message });
      } else {
        setRestoreFeedback({ type: 'error', msg: res.message });
      }
    } catch (err: any) {
      setRestoreFeedback({ type: 'error', msg: `Invalid JSON syntax: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('adminConfig', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
              Database: bru_sis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            phpMyAdmin database sync, academic calendar configuration, database snapshots, and user RBAC controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSqlDump}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
            title="Download bru_sis.sql for phpMyAdmin import"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download bru_sis.sql</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('database_structure')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'database_structure'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Database Structure (bru_sis)</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Academic Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'backups'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Backup & Recovery</span>
        </button>

        <button
          onClick={() => setActiveTab('bulk_import')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bulk_import'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Bulk Student Import</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts & RBAC</span>
        </button>
      </div>

      {/* Tab 0: PHPMYADMIN DATABASE STRUCTURE FOR bru_sis */}
      {activeTab === 'database_structure' && (
        <div className="space-y-6 text-xs">
          {/* phpMyAdmin Connection & Import Instructions Box */}
          <div className="bg-emerald-950 text-emerald-100 p-5 rounded-xl border border-emerald-900 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    MySQL / phpMyAdmin Integration: Database <span className="font-mono text-emerald-300">bru_sis</span>
                  </h2>
                  <p className="text-xs text-emerald-300">
                    Host: <span className="font-mono text-white">localhost:3306</span> · Database: <span className="font-mono text-white">bru_sis</span> · Collation: <span className="font-mono text-white">utf8mb4_unicode_ci</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySqlDump}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-lg border border-emerald-700 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Dump'}</span>
                </button>
                <button
                  onClick={handleDownloadSqlDump}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download bru_sis.sql</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-emerald-900/60 rounded-lg border border-emerald-800/80 text-[11px] space-y-1">
              <span className="font-bold text-white uppercase tracking-wider block">
                How to import into your local phpMyAdmin:
              </span>
              <p className="text-emerald-200 leading-relaxed">
                1. Click <strong>"Download bru_sis.sql"</strong> above.<br />
                2. In your local browser, navigate to <strong>http://localhost/phpmyadmin/</strong> (or your local XAMPP/WAMP MySQL dashboard).<br />
                3. Click the <strong>"Import"</strong> tab at the top, select the downloaded <code className="bg-emerald-950 px-1 py-0.5 rounded text-white">bru_sis.sql</code> file, and click <strong>Go</strong>. The entire Borana University database schema and sample records will be imported immediately.
              </p>
            </div>
          </div>

          {/* Database Object Sub-Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setDbSubTab('tables')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                dbSubTab === 'tables' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tables ({dbTables.length})</span>
            </button>
            <button
              onClick={() => setDbSubTab('views')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                dbSubTab === 'views' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Views (5)</span>
            </button>
            <button
              onClick={() => setDbSubTab('procedures')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                dbSubTab === 'procedures' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-purple-400" />
              <span>Stored Procedures & Functions (6)</span>
            </button>
            <button
              onClick={() => setDbSubTab('triggers')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                dbSubTab === 'triggers' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Triggers & Events (3)</span>
            </button>
            <button
              onClick={() => setDbSubTab('sql_console')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                dbSubTab === 'sql_console' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>SQL Query Console</span>
            </button>
          </div>

          {/* SubTab: Tables Structure */}
          {dbSubTab === 'tables' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Database Structure: <span className="font-mono text-emerald-800">bru_sis</span> ({dbTables.length} Tables)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Relational table schema, indexing keys, and record cardinality.
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  Total Rows: {dbTables.reduce((acc, t) => acc + t.rows, 0)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Table Name</th>
                      <th className="px-4 py-3">Description / Module</th>
                      <th className="px-4 py-3 text-right">Rows</th>
                      <th className="px-4 py-3">Engine</th>
                      <th className="px-4 py-3">Collation</th>
                      <th className="px-4 py-3 text-right">Data Size</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbTables.map((t) => {
                      const isSelected = selectedDbTable === t.name;

                      return (
                        <React.Fragment key={t.name}>
                          <tr
                            onClick={() => setSelectedDbTable(isSelected ? null : t.name)}
                            className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                              isSelected ? 'bg-emerald-50/40 font-medium' : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                              {isSelected ? <ChevronDown className="w-3.5 h-3.5 text-emerald-700" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                              <span>{t.name}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{t.label}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {t.rows}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600">{t.engine}</td>
                            <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{t.collation}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">{t.size}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-emerald-700 hover:underline font-semibold text-[11px]">
                                {isSelected ? 'Close Schema' : 'View Columns'}
                              </span>
                            </td>
                          </tr>

                          {/* Expanded Column Schema Inspector */}
                          {isSelected && (
                            <tr className="bg-slate-50/90">
                              <td colSpan={7} className="p-4">
                                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2">
                                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                                    Column Definitions for Table <code className="text-emerald-800 font-mono">`{t.name}`</code>:
                                  </span>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11px]">
                                      <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
                                        <tr>
                                          <th className="px-2 py-1.5">#</th>
                                          <th className="px-2 py-1.5">Column Field</th>
                                          <th className="px-2 py-1.5">Data Type</th>
                                          <th className="px-2 py-1.5">Null</th>
                                          <th className="px-2 py-1.5">Key</th>
                                          <th className="px-2 py-1.5">Default</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 font-mono">
                                        {t.columns.map((c, colIdx) => (
                                          <tr key={c.field}>
                                            <td className="px-2 py-1 text-slate-400">{colIdx + 1}</td>
                                            <td className="px-2 py-1 font-bold text-slate-900">{c.field}</td>
                                            <td className="px-2 py-1 text-blue-700">{c.type}</td>
                                            <td className="px-2 py-1 text-slate-600">{c.null}</td>
                                            <td className="px-2 py-1 text-emerald-700 font-bold">{c.key}</td>
                                            <td className="px-2 py-1 text-slate-500">{c.default}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab: Views */}
          {dbSubTab === 'views' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      MySQL Database Views in <code className="font-mono text-emerald-800">bru_sis</code>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Materialized query views defined in the database for official university reporting.
                    </p>
                  </div>
                  <select
                    value={activeViewName}
                    onChange={(e) => setActiveViewName(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold"
                  >
                    <option value="vw_dean_honor_roll">vw_dean_honor_roll (CGPA &ge; 3.50)</option>
                    <option value="vw_academic_support_list">vw_academic_support_list (CGPA &lt; 2.00)</option>
                    <option value="vw_course_enrollment_summary">vw_course_enrollment_summary</option>
                    <option value="vw_attendance_deficits">vw_attendance_deficits (&lt; 75% Attendance)</option>
                    <option value="vw_student_cgpa_ranking">vw_student_cgpa_ranking (Full Cohort)</option>
                  </select>
                </div>

                {/* Render Selected View Data */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  {activeViewName === 'vw_dean_honor_roll' && (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-emerald-50 text-emerald-900 font-bold uppercase text-[10px] border-b border-emerald-200">
                        <tr>
                          <th className="px-3 py-2">student_id</th>
                          <th className="px-3 py-2">full_name</th>
                          <th className="px-3 py-2">program</th>
                          <th className="px-3 py-2">year_of_study</th>
                          <th className="px-3 py-2 text-right">cgpa</th>
                          <th className="px-3 py-2">academic_classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {students.filter((s) => s.cgpa >= 3.5).map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-bold text-emerald-800">{s.studentId}</td>
                            <td className="px-3 py-2 font-sans font-medium text-slate-900">{s.fullName}</td>
                            <td className="px-3 py-2 font-sans text-slate-600">{s.program}</td>
                            <td className="px-3 py-2 text-slate-700">Year {s.yearOfStudy}</td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900">{s.cgpa.toFixed(2)}</td>
                            <td className="px-3 py-2 font-sans text-emerald-700 font-semibold">
                              {s.cgpa >= 3.8 ? 'Very High Distinction (Dean\'s List)' : 'Distinction (Honor Roll)'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeViewName === 'vw_academic_support_list' && (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-amber-50 text-amber-900 font-bold uppercase text-[10px] border-b border-amber-200">
                        <tr>
                          <th className="px-3 py-2">student_id</th>
                          <th className="px-3 py-2">full_name</th>
                          <th className="px-3 py-2">program</th>
                          <th className="px-3 py-2">year_of_study</th>
                          <th className="px-3 py-2 text-right">cgpa</th>
                          <th className="px-3 py-2">academic_classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {students.filter((s) => s.cgpa < 2.0).map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-bold text-rose-800">{s.studentId}</td>
                            <td className="px-3 py-2 font-sans font-medium text-slate-900">{s.fullName}</td>
                            <td className="px-3 py-2 font-sans text-slate-600">{s.program}</td>
                            <td className="px-3 py-2 text-slate-700">Year {s.yearOfStudy}</td>
                            <td className="px-3 py-2 text-right font-bold text-rose-700">{s.cgpa.toFixed(2)}</td>
                            <td className="px-3 py-2 font-sans text-rose-700 font-semibold">
                              {s.cgpa >= 1.75 ? 'Academic Warning' : 'Academic Probation'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeViewName === 'vw_course_enrollment_summary' && (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-[10px] border-b border-blue-200">
                        <tr>
                          <th className="px-3 py-2">course_code</th>
                          <th className="px-3 py-2">course_title</th>
                          <th className="px-3 py-2">section</th>
                          <th className="px-3 py-2">classroom</th>
                          <th className="px-3 py-2 text-right">enrolled_count</th>
                          <th className="px-3 py-2 text-right">capacity</th>
                          <th className="px-3 py-2 text-right">available_seats</th>
                          <th className="px-3 py-2 text-right">fill_percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {offerings.map((o) => {
                          const c = courses.find((crs) => crs.id === o.courseId);
                          const avail = Math.max(0, o.capacity - o.enrolledCount);
                          const fillPct = Math.round((o.enrolledCount / o.capacity) * 100);
                          return (
                            <tr key={o.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-bold text-blue-800">{c?.code}</td>
                              <td className="px-3 py-2 font-sans font-medium text-slate-900">{c?.title}</td>
                              <td className="px-3 py-2 font-sans text-slate-600">{o.section}</td>
                              <td className="px-3 py-2 font-sans text-slate-600">{o.classroom}</td>
                              <td className="px-3 py-2 text-right font-bold text-slate-900">{o.enrolledCount}</td>
                              <td className="px-3 py-2 text-right text-slate-600">{o.capacity}</td>
                              <td className="px-3 py-2 text-right font-bold text-emerald-700">{avail}</td>
                              <td className="px-3 py-2 text-right text-slate-700">{fillPct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {activeViewName === 'vw_attendance_deficits' && (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-rose-50 text-rose-900 font-bold uppercase text-[10px] border-b border-rose-200">
                        <tr>
                          <th className="px-3 py-2">student_id</th>
                          <th className="px-3 py-2">full_name</th>
                          <th className="px-3 py-2">course_code</th>
                          <th className="px-3 py-2">course_title</th>
                          <th className="px-3 py-2 text-right">attendance_percentage</th>
                          <th className="px-3 py-2 text-right">exam_eligibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {enrollments.filter((e) => e.attendancePercentage < 75).map((e) => {
                          const st = students.find((s) => s.id === e.studentId);
                          const c = courses.find((crs) => crs.id === e.courseId);
                          return (
                            <tr key={e.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-bold text-rose-800">{st?.studentId}</td>
                              <td className="px-3 py-2 font-sans font-medium text-slate-900">{st?.fullName}</td>
                              <td className="px-3 py-2 text-slate-800">{c?.code}</td>
                              <td className="px-3 py-2 font-sans text-slate-600">{c?.title}</td>
                              <td className="px-3 py-2 text-right font-bold text-rose-700">{e.attendancePercentage}%</td>
                              <td className="px-3 py-2 text-right text-rose-700 font-bold font-sans">
                                BARRED_FROM_FINAL_EXAM (&lt;75%)
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {activeViewName === 'vw_student_cgpa_ranking' && (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">student_id</th>
                          <th className="px-3 py-2">full_name</th>
                          <th className="px-3 py-2">gender</th>
                          <th className="px-3 py-2">department</th>
                          <th className="px-3 py-2">year_of_study</th>
                          <th className="px-3 py-2 text-right">cgpa</th>
                          <th className="px-3 py-2">academic_status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {students.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-bold text-emerald-800">{s.studentId}</td>
                            <td className="px-3 py-2 font-sans font-medium text-slate-900">{s.fullName}</td>
                            <td className="px-3 py-2 font-sans text-slate-600">{s.gender}</td>
                            <td className="px-3 py-2 font-sans text-slate-600">{departments.find((d) => d.id === s.departmentId)?.code}</td>
                            <td className="px-3 py-2 text-slate-700">Yr {s.yearOfStudy} · Sem {s.currentSemester}</td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900">{s.cgpa.toFixed(2)}</td>
                            <td className="px-3 py-2 font-sans text-slate-700">{s.academicStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SubTab: Stored Procedures & Functions */}
          {dbSubTab === 'procedures' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Procedures Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-purple-800 font-bold uppercase text-[11px]">
                  <Code className="w-4 h-4" />
                  <span>Stored Procedures in bru_sis</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-950 text-xs">sp_update_cumulative_cgpa(p_student_id)</span>
                      <button
                        onClick={() => {
                          const target = students[0];
                          if (target) {
                            alert(`Executing sp_update_cumulative_cgpa('${target.id}')... Recomputed CGPA: ${target.cgpa.toFixed(2)}`);
                          }
                        }}
                        className="px-2.5 py-1 bg-purple-700 text-white rounded text-[11px] font-semibold hover:bg-purple-800"
                      >
                        Execute Test
                      </button>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Recomputes cumulative quality points and CGPA dynamically across all published grade records.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-950 text-xs">sp_publish_official_grades(p_offering_id, p_by)</span>
                      <button
                        onClick={() => {
                          const off = offerings[0];
                          if (off) {
                            alert(`Executing sp_publish_official_grades('${off.id}', 'Mr. Wario Galma')... Marked Senate Approved & Audited.`);
                          }
                        }}
                        className="px-2.5 py-1 bg-purple-700 text-white rounded text-[11px] font-semibold hover:bg-purple-800"
                      >
                        Execute Test
                      </button>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Senate publishing procedure invoked by Registrar Director Mr. Wario Galma to publish official student marks.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-950 text-xs">sp_process_add_drop(p_enr_id, p_decision, ...)</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Automated Triggered</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Evaluates prerequisite eligibility, adjusts section capacity, and records decision reason into database.
                    </p>
                  </div>
                </div>
              </div>

              {/* Functions Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase text-[11px]">
                  <Terminal className="w-4 h-4" />
                  <span>Stored Functions (Senate Rules)</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-950 text-xs">fn_calculate_letter_grade(mark)</span>
                      <span className="font-mono font-bold text-emerald-800">88.5 &rarr; 'A'</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Deterministic Senate grading function mapping continuous total (0-100) to A+, A, A-, B+, B, B-, C+, C, C-, D, F.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-950 text-xs">fn_calculate_grade_point(mark)</span>
                      <span className="font-mono font-bold text-emerald-800">88.5 &rarr; 4.00 GP</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Calculates standard higher education 4.00 quality points for graduation and transcript reporting.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-950 text-xs">fn_check_exam_qualification(stud, off)</span>
                      <span className="font-mono font-bold text-emerald-800">&ge; 75% &rarr; QUALIFIED</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Evaluates whether student attendance satisfies the 75% Senate threshold to sit for final semester examinations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab: Triggers & Scheduled Events */}
          {dbSubTab === 'triggers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold uppercase text-[11px]">
                  <Shield className="w-4 h-4" />
                  <span>Database Triggers in bru_sis</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-mono font-bold text-slate-900 block text-xs">trg_grade_records_after_update</span>
                    <p className="text-slate-600 text-[11px]">
                      AFTER UPDATE ON <code className="text-emerald-800">grade_records</code>: Automatically records old mark, new mark, old letter grade, new letter grade, and user into <code className="text-emerald-800">grade_change_logs</code>.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-mono font-bold text-slate-900 block text-xs">trg_course_enrollment_capacity</span>
                    <p className="text-slate-600 text-[11px]">
                      AFTER INSERT/UPDATE ON <code className="text-emerald-800">course_enrollments</code>: Automatically increments or decrements <code className="text-emerald-800">enrolled_count</code> on <code className="text-emerald-800">course_offerings</code> upon status transition.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold uppercase text-[11px]">
                  <Clock className="w-4 h-4" />
                  <span>Scheduled MySQL Events</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 text-xs">ev_daily_attendance_audit</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        SCHEDULED DAILY 23:50
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Runs daily to audit attendance percentages across all course offerings and alert academic advisors of students at risk of exam disqualification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab: SQL Console */}
          {dbSubTab === 'sql_console' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-700" />
                  <span>SQL Query Sandbox (Database: bru_sis)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Execute queries against the active database state. (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded">SELECT * FROM vw_dean_honor_roll</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">SELECT * FROM vw_course_enrollment_summary</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">SELECT * FROM students</code>)
                </p>
              </div>

              <form onSubmit={handleRunQuery} className="space-y-3">
                <textarea
                  rows={3}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg bg-slate-900 text-emerald-300 focus:outline-emerald-500"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Target DB: bru_sis · Host: localhost:3306
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Run Query (Go)
                  </button>
                </div>
              </form>

              {queryResult && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Query Results ({queryResult.length} rows returned)
                    </span>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-mono uppercase font-bold text-[10px]">
                        <tr>
                          {Object.keys(queryResult[0] || {}).map((key) => (
                            <th key={key} className="px-3 py-1.5">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {queryResult.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {Object.values(row).map((val: any, vIdx) => (
                              <td key={vIdx} className="px-3 py-1.5">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Calendar & Regulations */}
      {activeTab === 'calendar' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl space-y-5 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Academic Calendar & Senate Regulations</h2>
            <p className="text-slate-500">
              Configure current term parameters enforced system-wide across all modules.
            </p>
          </div>

          {calSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Academic calendar parameters successfully updated and audit logged.</span>
            </div>
          )}

          <form onSubmit={handleCalendarSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current Semester</label>
                <select
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value={1}>Semester I (Regular)</option>
                  <option value={2}>Semester II (Regular)</option>
                  <option value={3}>Kiremt / Summer Term</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Add/Drop Deadline</label>
                <input
                  type="date"
                  value={addDropDeadline}
                  onChange={(e) => setAddDropDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Grade Submission Deadline</label>
                <input
                  type="date"
                  value={gradeDeadline}
                  onChange={(e) => setGradeDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Credit Hours / Semester</label>
                <input
                  type="number"
                  min="12"
                  max="25"
                  value={maxCredits}
                  onChange={(e) => setMaxCredits(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Probation Threshold</label>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="2.5"
                  value={probationThreshold}
                  onChange={(e) => setProbationThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Save Senate Configurations
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Backups & Restoration */}
      {activeTab === 'backups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Create Backup */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>Create Institutional Backup Snapshot</span>
              </h2>
              <p className="text-slate-500 mt-1">
                Generates a verified JSON snapshot containing student records, grade archives, offerings, and audit trails.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Backup Format:</span>
                <span className="font-mono font-semibold text-slate-900">Standard JSON Schema</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Security Standard:</span>
                <span className="text-slate-900">Confidential Registrar Store</span>
              </div>
            </div>

            <button
              onClick={() => createBackupSnapshot()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Live Database Snapshot</span>
            </button>

            {/* Past Snapshots */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Recorded Snapshots Log ({backups.length})
              </span>
              {backups.map((b) => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-mono font-semibold text-slate-800 truncate max-w-[220px]">{b.filename}</span>
                    <span className="font-mono text-slate-500">{b.sizeKb} KB</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>{b.createdBy}</span>
                    <span>{b.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Restore Database */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-700" />
                <span>Restore Database from Snapshot</span>
              </h2>
              <p className="text-slate-500 mt-1">
                Paste JSON snapshot payload below to restore academic state. Referential integrity is strictly validated.
              </p>
            </div>

            {restoreFeedback && (
              <div
                className={`p-3 rounded-lg border flex items-center gap-2 ${
                  restoreFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {restoreFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
                )}
                <span>{restoreFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handleRestoreSubmit} className="space-y-3">
              <textarea
                rows={8}
                placeholder="Paste backup snapshot JSON here..."
                value={restoreJson}
                onChange={(e) => setRestoreJson(e.target.value)}
                className="w-full p-3 font-mono text-[11px] border border-slate-300 rounded-lg bg-slate-50"
              />

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Validate & Execute Database Restoration</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Bulk Student Import */}
      {activeTab === 'bulk_import' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-3xl space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Bulk Student Registry Import</span>
            </h2>
            <p className="text-slate-500 mt-1">
              Import newly admitted student cohorts directly from CSV. Required fields: Student ID, National ID, Full Name, Gender, Birth Date, Phone, Email, Address, Zone, Department ID, Program, Year, Semester.
            </p>
          </div>

          {importResults && (
            <div
              className={`p-4 rounded-lg border space-y-1 ${
                importResults.errors.length === 0
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Successfully imported {importResults.successCount} student records.</span>
              </div>
              {importResults.errors.length > 0 && (
                <div className="pt-2 text-rose-700 space-y-1">
                  <span className="font-bold">Errors encountered during validation:</span>
                  <ul className="list-disc pl-5">
                    {importResults.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleBulkImportSubmit} className="space-y-3">
            <label className="block text-slate-700 font-semibold">CSV Content (1 student per line):</label>
            <textarea
              rows={8}
              required
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 font-mono text-[11px] border border-slate-300 rounded-lg bg-slate-50"
            />

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Validate & Import Students
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: User Accounts & RBAC Matrix */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Institutional User Accounts & Role Permissions</h2>
            <p className="text-xs text-slate-500">
              Stakeholder accounts governed by strict Role-Based Access Control (RBAC).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Institutional Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <div>{u.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">{u.username}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-emerald-800 uppercase text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{u.phoneNumber || '—'}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{u.lastLogin || '2026-10-27'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        {u.status}
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
  );
};
