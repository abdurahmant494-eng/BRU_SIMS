import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Calendar, Clock, MapPin, Search, Filter, BookOpen } from 'lucide-react';

export const TimetableView: React.FC = () => {
  const { offerings, courses, departments, language, calendarConfig, currentRole } = useApp();
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [viewType, setViewType] = useState<'weekly' | 'exams'>('weekly');

  const filteredOfferings = offerings.filter((o) => {
    if (selectedDeptId === 'ALL') return true;
    const course = courses.find((c) => c.id === o.courseId);
    return course?.departmentId === selectedDeptId;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('timetable', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {calendarConfig.academicYear} · Semester {calendarConfig.currentSemester}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weekly lecture schedules, computer lab allotments, and final examination room seating.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewType('weekly')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewType === 'weekly' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Class Grid
            </button>
            <button
              onClick={() => setViewType('exams')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewType === 'exams' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Examination Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Department Filter:</label>
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
        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredOfferings.length} scheduled sections
        </span>
      </div>

      {/* View 1: Weekly Class Grid */}
      {viewType === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOfferings.map((o) => {
            const course = courses.find((c) => c.id === o.courseId);
            const dept = departments.find((d) => d.id === course?.departmentId);

            return (
              <div key={o.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-emerald-800">{course?.code}</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {o.section}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{course?.title}</h3>
                <p className="text-xs text-slate-500">{dept?.name}</p>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-medium">{o.scheduleDays}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>{o.classroom}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <BookOpen className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>{course?.creditHours} Credit Hours ({course?.lectureHours}L, {course?.labHours}P)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View 2: Examination Schedule */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Course Code</th>
                  <th className="px-4 py-3">Course Title</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Exam Date</th>
                  <th className="px-4 py-3">Exam Hall</th>
                  <th className="px-4 py-3 text-right">Invigilator Notice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOfferings.map((o) => {
                  const course = courses.find((c) => c.id === o.courseId);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">{course?.code}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">{course?.title}</td>
                      <td className="px-4 py-3.5 text-slate-600">{o.section}</td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-900 tabular-nums">
                        {o.examDate || '2027-01-20'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium">
                        {o.examRoom || 'Main Examination Hall'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-emerald-800 font-medium text-[11px]">
                        ID Card & Hall Ticket Required
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
