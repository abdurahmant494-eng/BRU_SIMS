import React from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  FileText,
  Clock,
  Calendar,
  Settings,
  ShieldAlert,
  UserCheck,
  Building,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentRole, activeTab, setActiveTab, language } = useApp();

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    allowedRoles: string[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t('dashboard', language),
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'department_head', 'instructor', 'student', 'management', 'parent', 'ict_support'],
    },
    {
      id: 'students',
      label: t('studentRegistry', language),
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'department_head', 'management'],
    },
    {
      id: 'courses',
      label: currentRole === 'student' ? 'My Courses & Enrollment' : t('courseEnrollment', language),
      icon: <BookOpen className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'department_head', 'instructor', 'student', 'management'],
    },
    {
      id: 'grades',
      label: currentRole === 'student' ? 'My Grades' : t('gradebook', language),
      icon: <Award className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'department_head', 'instructor', 'student'],
    },
    {
      id: 'progression',
      label: currentRole === 'student' ? 'Academic Progress & Audit' : t('progression', language),
      icon: <TrendingUp className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'department_head', 'student', 'management', 'parent'],
    },
    {
      id: 'transcripts',
      label: currentRole === 'student' ? 'Official Transcript' : t('transcripts', language),
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'department_head', 'student', 'management'],
    },
    {
      id: 'attendance',
      label: t('attendance', language),
      icon: <Clock className="w-4 h-4" />,
      allowedRoles: ['admin', 'instructor', 'department_head', 'student', 'parent'],
    },
    {
      id: 'timetable',
      label: t('timetable', language),
      icon: <Calendar className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'department_head', 'instructor', 'student'],
    },
    {
      id: 'university_profile',
      label: 'About Borana University',
      icon: <Building className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'department_head', 'instructor', 'student', 'management', 'parent', 'ict_support'],
    },
    {
      id: 'admin_config',
      label: t('adminConfig', language),
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['admin', 'registrar', 'ict_support'],
    },
    {
      id: 'audit_logs',
      label: t('auditLogs', language),
      icon: <ShieldAlert className="w-4 h-4" />,
      allowedRoles: ['admin', 'management', 'ict_support', 'registrar'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.allowedRoles.includes(currentRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Academic Modules
        </div>
        {filteredNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-emerald-800 text-emerald-100 px-1.5 py-0.5 rounded font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Institutional Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-300 text-[11px] truncate">
            Borana University
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal">
          Ministry of Education · Federal Democratic Republic of Ethiopia
        </p>
      </div>
    </aside>
  );
};
