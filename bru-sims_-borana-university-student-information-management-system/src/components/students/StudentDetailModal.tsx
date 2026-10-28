import React, { useState } from 'react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { evaluateAcademicStanding } from '../../utils/gradeCalculations';
import {
  X,
  User,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Edit,
  Archive,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  const { currentRole, currentUser, departments, updateStudent, archiveStudent, restoreStudent } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editReason, setEditReason] = useState('');

  // Edit form state
  const [fullName, setFullName] = useState(student.fullName);
  const [phone, setPhone] = useState(student.phone);
  const [email, setEmail] = useState(student.email);
  const [address, setAddress] = useState(student.address);
  const [departmentId, setDepartmentId] = useState(student.departmentId);
  const [program, setProgram] = useState(student.program);
  const [yearOfStudy, setYearOfStudy] = useState(student.yearOfStudy);
  const [currentSemester, setCurrentSemester] = useState(student.currentSemester);
  const [academicStatus, setAcademicStatus] = useState(student.academicStatus);
  const [parentName, setParentName] = useState(student.parentGuardian?.name || '');
  const [parentPhone, setParentPhone] = useState(student.parentGuardian?.phone || '');
  const [canViewGrades, setCanViewGrades] = useState(student.parentGuardian?.canViewGrades ?? true);

  const [archiveReason, setArchiveReason] = useState('');
  const [showArchivePrompt, setShowArchivePrompt] = useState(false);

  const dept = departments.find((d) => d.id === student.departmentId);
  const standing = evaluateAcademicStanding(student.cgpa);

  const canEdit = currentRole === 'registrar' || currentRole === 'admin';

  const handleSave = () => {
    if (!editReason.trim()) {
      alert('Please specify the official reason/authorization for modifying this student record.');
      return;
    }
    updateStudent(
      student.id,
      {
        fullName,
        phone,
        email,
        address,
        departmentId,
        program,
        yearOfStudy: Number(yearOfStudy),
        currentSemester: Number(currentSemester),
        academicStatus,
        parentGuardian: {
          ...student.parentGuardian,
          name: parentName,
          phone: parentPhone,
          canViewGrades,
        },
      },
      editReason
    );
    setIsEditing(false);
    setEditReason('');
  };

  const handleArchive = () => {
    if (!archiveReason.trim()) {
      alert('Please state the reason for archiving this student record.');
      return;
    }
    archiveStudent(student.id, archiveReason);
    setShowArchivePrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center font-mono">
              {student.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{student.fullName}</h2>
                {student.isArchived && (
                  <span className="text-[10px] bg-rose-900 text-rose-200 border border-rose-700 px-1.5 py-0.5 rounded font-bold uppercase">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {student.studentId} · National ID: {student.nationalId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 text-[11px] block uppercase font-semibold">Cumulative CGPA</span>
              <span className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
                {student.cgpa > 0 ? student.cgpa.toFixed(2) : '—'}
              </span>
              <span className="block text-[10px] text-slate-400">/ 4.00 Scale</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block uppercase font-semibold">Credits Earned</span>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {student.totalCreditsEarned}
              </span>
              <span className="block text-[10px] text-slate-400">Credit Hours</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block uppercase font-semibold">Standing</span>
              <span className="text-xs font-bold text-slate-900 block truncate">{standing.standingLabel}</span>
              <span className="block text-[10px] text-slate-400">{student.academicStatus}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block uppercase font-semibold">Admitted</span>
              <span className="text-sm font-bold font-mono text-slate-900">{student.admissionYear}</span>
              <span className="block text-[10px] text-slate-400">Undergraduate Placement</span>
            </div>
          </div>

          {/* Edit Form OR View Details */}
          {isEditing ? (
            <div className="space-y-4 border border-emerald-200 bg-emerald-50/20 p-4 rounded-xl">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200 text-emerald-950 font-bold text-sm">
                <span>Record Correction & Update Form</span>
                <span className="text-xs font-normal text-slate-500">Authorized: Registrar / Admin</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">University Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Home / Woreda Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Program Name</label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Year of Study</label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Semester</label>
                  <select
                    value={currentSemester}
                    onChange={(e) => setCurrentSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Academic Status</label>
                  <select
                    value={academicStatus}
                    onChange={(e) => setAcademicStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Academic Warning">Academic Warning</option>
                    <option value="Academic Probation">Academic Probation</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Correction / Change <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approved Senate status update, spelling correction on national ID"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  Save Corrections
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  Personal & Identity
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender</span>
                    <span className="font-medium text-slate-900">{student.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth</span>
                    <span className="font-medium font-mono text-slate-900">{student.birthDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium font-mono text-slate-900">{student.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium text-slate-900 truncate max-w-[180px]">{student.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zone / Woreda</span>
                    <span className="font-medium text-slate-900">{student.woredaZone}</span>
                  </div>
                </div>
              </div>

              {/* Academic Placement */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  Academic Placement
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department</span>
                    <span className="font-medium text-slate-900 text-right">{dept?.name || student.departmentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Program</span>
                    <span className="font-medium text-slate-900 text-right">{student.program}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Study Level</span>
                    <span className="font-medium text-slate-900">Year {student.yearOfStudy} · Semester {student.currentSemester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Year</span>
                    <span className="font-medium font-mono text-slate-900">{student.academicYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Status</span>
                    <span className="font-semibold text-emerald-800">{student.academicStatus}</span>
                  </div>
                </div>
              </div>

              {/* Emergency & Parent Contact */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  Parent / Guardian & Emergency
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parent / Guardian</span>
                    <span className="font-medium text-slate-900">{student.parentGuardian?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Relationship</span>
                    <span className="font-medium text-slate-900">{student.parentGuardian?.relationship || 'Guardian'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parent Phone</span>
                    <span className="font-medium font-mono text-slate-900">{student.parentGuardian?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authorized Grade View</span>
                    <span className="font-semibold text-slate-900">
                      {student.parentGuardian?.canViewGrades ? 'Yes (Authorized)' : 'No (Restricted)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Contact</span>
                    <span className="font-medium text-slate-900">
                      {student.emergencyContact?.name} ({student.emergencyContact?.phone})
                    </span>
                  </div>
                </div>
              </div>

              {/* Archive / Status Action Block */}
              {canEdit && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Institutional Lifecycle Actions
                  </h3>
                  {student.isArchived ? (
                    <div>
                      <p className="text-slate-600 mb-2">This record is currently archived in the permanent registry.</p>
                      <button
                        onClick={() => restoreStudent(student.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore to Active Registry</span>
                      </button>
                    </div>
                  ) : showArchivePrompt ? (
                    <div className="space-y-2">
                      <p className="text-rose-700 font-medium">Confirm Record Archiving:</p>
                      <input
                        type="text"
                        placeholder="State reason (e.g. Graduation, Transfer, Official withdrawal)"
                        value={archiveReason}
                        onChange={(e) => setArchiveReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-rose-300 rounded text-xs bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleArchive}
                          className="px-3 py-1 text-xs font-semibold bg-rose-700 text-white rounded hover:bg-rose-800"
                        >
                          Confirm Archive
                        </button>
                        <button
                          onClick={() => setShowArchivePrompt(false)}
                          className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-500 mb-2">
                        Archive when a student transfers, completes graduation clearance, or ceases study.
                      </p>
                      <button
                        onClick={() => setShowArchivePrompt(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive Record</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Record History & Audit Trail */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Record Modification History & Senate Audit Trail</span>
            </h3>
            <div className="space-y-2">
              {student.history && student.history.length > 0 ? (
                student.history.map((hist) => (
                  <div key={hist.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{hist.action}</span>
                      <span className="font-mono text-slate-400 tabular-nums">{hist.date}</span>
                    </div>
                    <p className="text-slate-600 text-xs">{hist.details}</p>
                    <span className="text-[10px] text-slate-400 block">Authorized By: {hist.changedBy}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs">No historical corrections logged.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Borana University Registrar Division · Form SIMS-REC-01
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
