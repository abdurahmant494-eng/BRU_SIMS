import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';
import { t } from '../../utils/translations';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  Archive,
  RotateCcw,
  UserCheck,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const StudentRegistryView: React.FC = () => {
  const {
    students,
    departments,
    currentRole,
    language,
    registerStudent,
    calendarConfig,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showArchived, setShowArchived] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Registration Form State
  const [newStudentId, setNewStudentId] = useState(`BRU/UG/2026/0${Math.floor(100 + Math.random() * 899)}`);
  const [newNationalId, setNewNationalId] = useState(`ETH-OR-BOR-${Math.floor(10000 + Math.random() * 89999)}`);
  const [newFullName, setNewFullName] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female'>('Male');
  const [newBirthDate, setNewBirthDate] = useState('2005-06-15');
  const [newPhone, setNewPhone] = useState('+251 91 ');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('Yabello, Borana Zone');
  const [newWoredaZone, setNewWoredaZone] = useState('Yabello Woreda, Borana Zone, Oromia');
  const [newDeptId, setNewDeptId] = useState(departments[0]?.id || 'dept-cs');
  const [newProgram, setNewProgram] = useState('B.Sc. in Computer Science');
  const [newYearOfStudy, setNewYearOfStudy] = useState(1);
  const [newSemester, setNewSemester] = useState(1);
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');
  const [newEmergencyRelation, setNewEmergencyRelation] = useState('Parent');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newCanViewGrades, setNewCanViewGrades] = useState(true);
  const [regError, setRegError] = useState('');

  // Auto-fill program on department change
  const handleDeptChange = (deptId: string) => {
    setNewDeptId(deptId);
    if (deptId === 'dept-cs') setNewProgram('B.Sc. in Computer Science');
    else if (deptId === 'dept-agr') setNewProgram('B.Sc. in Dryland Agriculture & Pastoral Studies');
    else if (deptId === 'dept-wre') setNewProgram('B.Sc. in Water Resource & Irrigation Engineering');
    else if (deptId === 'dept-econ') setNewProgram('B.A. in Economics & Agribusiness Management');
    else if (deptId === 'dept-ph') setNewProgram('B.Sc. in Public Health & Nursing Sciences');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!newStudentId.trim() || !newFullName.trim()) {
      setRegError('Please provide both Student ID and Full Name.');
      return;
    }

    const res = registerStudent({
      studentId: newStudentId.trim(),
      nationalId: newNationalId.trim(),
      fullName: newFullName.trim(),
      gender: newGender,
      birthDate: newBirthDate,
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newStudentId.replace(/\//g, '.').toLowerCase()}@student.bru.edu.et`,
      address: newAddress.trim(),
      woredaZone: newWoredaZone.trim(),
      emergencyContact: {
        name: newEmergencyName.trim() || 'Parent/Guardian',
        phone: newEmergencyPhone.trim() || newPhone.trim(),
        relation: newEmergencyRelation,
      },
      parentGuardian: {
        name: newParentName.trim() || newEmergencyName.trim() || 'Family',
        phone: newParentPhone.trim() || newEmergencyPhone.trim(),
        email: '',
        relationship: newEmergencyRelation,
        canViewGrades: newCanViewGrades,
      },
      admissionYear: 2026,
      academicYear: calendarConfig.academicYear,
      departmentId: newDeptId,
      program: newProgram,
      yearOfStudy: Number(newYearOfStudy),
      currentSemester: Number(newSemester),
      academicStatus: 'Active',
    });

    if (!res.success) {
      setRegError(res.error || 'Failed to register student.');
      return;
    }

    // Reset and close
    setShowRegisterModal(false);
    setNewFullName('');
    setNewStudentId(`BRU/UG/2026/0${Math.floor(100 + Math.random() * 899)}`);
    if (res.student) {
      setSelectedStudent(res.student);
    }
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Archive toggle
      if (showArchived && !s.isArchived) return false;
      if (!showArchived && s.isArchived) return false;

      // Department filter
      if (departmentFilter !== 'ALL' && s.departmentId !== departmentFilter) return false;

      // Year filter
      if (yearFilter !== 'ALL' && s.yearOfStudy !== Number(yearFilter)) return false;

      // Status filter
      if (statusFilter !== 'ALL' && s.academicStatus !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchId = s.studentId.toLowerCase().includes(q);
        const matchNational = s.nationalId?.toLowerCase().includes(q);
        const matchPhone = s.phone?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchNational && !matchPhone) return false;
      }

      return true;
    });
  }, [students, showArchived, departmentFilter, yearFilter, statusFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Gender', 'Department', 'Program', 'Year', 'Semester', 'CGPA', 'Status', 'Phone', 'Email'];
    const rows = filteredStudents.map((s) => [
      `"${s.studentId}"`,
      `"${s.fullName}"`,
      s.gender,
      `"${departments.find((d) => d.id === s.departmentId)?.name || s.departmentId}"`,
      `"${s.program}"`,
      s.yearOfStudy,
      s.currentSemester,
      s.cgpa.toFixed(2),
      s.academicStatus,
      `"${s.phone}"`,
      `"${s.email}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `borana_university_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canRegister = currentRole === 'registrar' || currentRole === 'admin';

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('studentRegistry', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 tabular-nums">
              {filteredStudents.length} {showArchived ? 'Archived Records' : 'Active Students'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official student record management, identity validation, and institutional registry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('exportCSV', language)}</span>
          </button>

          {canRegister && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('addStudent', language)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name, national ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-600 bg-slate-50/50"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-600 bg-slate-50/50"
            >
              <option value="ALL">All Years of Study</option>
              <option value="1">Year 1 (Freshman)</option>
              <option value="2">Year 2 (Sophomore)</option>
              <option value="3">Year 3 (Junior)</option>
              <option value="4">Year 4 (Senior)</option>
              <option value="5">Year 5 (Final)</option>
            </select>
          </div>

          {/* Academic Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-600 bg-slate-50/50"
            >
              <option value="ALL">All Academic Statuses</option>
              <option value="Active">Active</option>
              <option value="Academic Warning">Academic Warning</option>
              <option value="Academic Probation">Academic Probation</option>
              <option value="Suspended">Suspended</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>
        </div>

        {/* Bottom Toggle Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                !showArchived ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Students ({students.filter((s) => !s.isArchived).length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                showArchived ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Archived Archive ({students.filter((s) => s.isArchived).length})
            </button>
          </div>

          {(searchQuery || departmentFilter !== 'ALL' || yearFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('ALL');
                setYearFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Full Legal Name</th>
                <th className="px-4 py-3">Program / Department</th>
                <th className="px-4 py-3">Year / Sem</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">CGPA</th>
                <th className="px-4 py-3 text-right">Academic Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No student records matching current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">{st.studentId}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 block">{st.fullName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">NAT-ID: {st.nationalId}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-800 block truncate max-w-xs">{st.program}</span>
                      <span className="text-[11px] text-slate-400">
                        {departments.find((d) => d.id === st.departmentId)?.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 tabular-nums">
                      Yr {st.yearOfStudy} · Sem {st.currentSemester}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                      <div>{st.phone}</div>
                      <div className="text-slate-400 truncate max-w-[140px]">{st.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums text-sm">
                      {st.cgpa > 0 ? st.cgpa.toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          st.academicStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : st.academicStatus === 'Academic Warning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : st.academicStatus === 'Academic Probation'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {st.academicStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                      >
                        {t('viewDetails', language)}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* New Student Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight">
                  Borana University · Student Registration Form
                </h2>
                <p className="text-xs text-emerald-200">
                  Admissions Office · Enrollment into Academic Year {calendarConfig.academicYear}
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-emerald-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Student ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                  />
                  <span className="text-[10px] text-slate-400">Institutional format: BRU/UG/YYYY/XXXX</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    National ID / Kebele Card <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Full Legal Name (Grandfather name inclusive) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liban Dida Halake"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Telephone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Academic Department</label>
                  <select
                    value={newDeptId}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Degree Program</label>
                  <input
                    type="text"
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Year of Study</label>
                  <select
                    value={newYearOfStudy}
                    onChange={(e) => setNewYearOfStudy(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Semester</label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {[1, 2].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 block mb-2">Emergency Contact & Parent Details</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dida Halake"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Parent Telephone</label>
                  <input
                    type="text"
                    placeholder="+251 9..."
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
