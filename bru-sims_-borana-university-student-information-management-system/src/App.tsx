import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentRegistryView } from './components/students/StudentRegistryView';
import { CourseEnrollmentView } from './components/courses/CourseEnrollmentView';
import { GradebookView } from './components/grades/GradebookView';
import { ProgressionView } from './components/academic/ProgressionView';
import { TranscriptsView } from './components/reports/TranscriptsView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { TimetableView } from './components/timetable/TimetableView';
import { UniversityProfileView } from './components/university/UniversityProfileView';
import { SystemAdminView } from './components/admin/SystemAdminView';
import { AuditLogsView } from './components/audit/AuditLogsView';

const MainLayout: React.FC = () => {
  const { activeTab, currentRole } = useApp();

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentRegistryView />;
      case 'courses':
        return <CourseEnrollmentView />;
      case 'grades':
        return <GradebookView />;
      case 'progression':
        return <ProgressionView />;
      case 'transcripts':
        return <TranscriptsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'timetable':
        return <TimetableView />;
      case 'university_profile':
        return <UniversityProfileView />;
      case 'admin_config':
        return <SystemAdminView />;
      case 'audit_logs':
        return <AuditLogsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="no-print">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveModule()}
        </main>
      </div>

      <footer className="no-print bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Borana University · Student Information Management System (BRU-SIMS)
          </span>
          <span className="text-[11px] text-slate-400">
            Yabello, Borana Zone, Oromia, Ethiopia · Federal Ministry of Education
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
