import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, LanguageCode } from '../../types';
import { t } from '../../utils/translations';
import {
  Bell,
  Globe,
  UserCheck,
  ChevronDown,
  Shield,
  GraduationCap,
  BookOpen,
  User,
  Building2,
  Users,
  Cpu,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    currentRole,
    switchRole,
    currentUser,
    calendarConfig,
    announcements,
    dismissAnnouncement,
    setActiveTab,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; subtitle: string; icon: React.ReactNode }> = {
    registrar: {
      title: 'University Registrar',
      subtitle: 'Admissions, records & publication',
      icon: <GraduationCap className="w-4 h-4 text-emerald-700" />,
    },
    instructor: {
      title: 'Course Instructor',
      subtitle: 'Class lists & grade entry',
      icon: <BookOpen className="w-4 h-4 text-blue-700" />,
    },
    department_head: {
      title: 'Department Head',
      subtitle: 'Curriculum & grade approvals',
      icon: <Building2 className="w-4 h-4 text-purple-700" />,
    },
    student: {
      title: 'Undergraduate Student',
      subtitle: 'Enrollment & transcript access',
      icon: <User className="w-4 h-4 text-amber-700" />,
    },
    admin: {
      title: 'System Administrator',
      subtitle: 'Config, users & backups',
      icon: <Shield className="w-4 h-4 text-rose-700" />,
    },
    management: {
      title: 'University Management',
      subtitle: 'VP Academic affairs & reporting',
      icon: <Building2 className="w-4 h-4 text-indigo-700" />,
    },
    parent: {
      title: 'Authorized Parent',
      subtitle: 'Limited child progress view',
      icon: <Users className="w-4 h-4 text-teal-700" />,
    },
    ict_support: {
      title: 'ICT Systems Support',
      subtitle: 'Audit logs & infrastructure',
      icon: <Cpu className="w-4 h-4 text-slate-700" />,
    },
  };

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setRoleDropdownOpen(false);
  };

  const visibleAnnouncements = announcements.filter((a) =>
    a.targetRoles.includes(currentRole)
  );

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left Zone: Brand and Academic Session */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/bru_university_crest_1793125542443.jpg"
              alt="Borana University Crest"
              className="w-10 h-10 object-contain rounded-full shadow-xs border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  BORANA UNIVERSITY
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  BRU-SIMS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Academic Year {calendarConfig.academicYear} · Semester {calendarConfig.currentSemester} · Yabello Campus
              </p>
            </div>
          </div>
        </div>

        {/* Right Zone: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setRoleDropdownOpen(false);
                setNotifOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="uppercase font-semibold">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    language === 'en' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>English (EN)</span>
                  {language === 'en' && <span>✓</span>}
                </button>
                <button
                  onClick={() => {
                    setLanguage('om');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    language === 'om' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>Afaan Oromoo (OM)</span>
                  {language === 'om' && <span>✓</span>}
                </button>
                <button
                  onClick={() => {
                    setLanguage('am');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    language === 'am' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>አማርኛ (AM)</span>
                  {language === 'am' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setRoleDropdownOpen(false);
                setLangDropdownOpen(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="System Announcements"
            >
              <Bell className="w-4 h-4" />
              {visibleAnnouncements.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
                <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Institutional Bulletins ({visibleAnnouncements.length})
                  </span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {visibleAnnouncements.length === 0 ? (
                    <p className="p-4 text-center text-slate-400">No active bulletins for your role</p>
                  ) : (
                    visibleAnnouncements.map((ann) => (
                      <div key={ann.id} className="p-3 hover:bg-slate-50 relative group">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800">{ann.title}</p>
                          <button
                            onClick={() => dismissAnnouncement(ann.id)}
                            className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-2">{ann.content}</p>
                        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                          <span>{ann.author}</span>
                          <span>{ann.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher (Crucial for testing all 8 roles & RBAC) */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setLangDropdownOpen(false);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <div className="text-left hidden md:block">
                <span className="block text-[10px] text-emerald-700 uppercase tracking-wider font-bold">
                  Active Persona
                </span>
                <span className="font-bold text-slate-900">{roleLabels[currentRole].title}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-3 pb-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{t('quickRoleSwitch', language)}</p>
                  <p className="text-[11px] text-slate-500">
                    Switch permission persona to verify role-specific academic workflows
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-50 text-xs">
                  {(Object.keys(roleLabels) as UserRole[]).map((rKey) => {
                    const item = roleLabels[rKey];
                    const isCurrent = currentRole === rKey;
                    return (
                      <button
                        key={rKey}
                        onClick={() => handleRoleSelect(rKey)}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors ${
                          isCurrent ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 p-1 rounded bg-slate-100">{item.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{item.title}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">{item.subtitle}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left text-xs">
              <span className="font-semibold text-slate-900 block leading-tight">{currentUser.fullName}</span>
              <span className="text-slate-500 text-[11px]">{currentUser.email}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
