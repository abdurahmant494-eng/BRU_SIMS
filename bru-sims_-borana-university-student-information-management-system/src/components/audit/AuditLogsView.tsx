import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';
import { t } from '../../utils/translations';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Info,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedModule !== 'ALL' && log.module !== selectedModule) return false;
    if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Module', 'Action', 'Severity', 'IP Address', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      l.role,
      `"${l.module}"`,
      `"${l.action}"`,
      l.severity,
      l.ipAddress,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bru_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('auditLogs', language)}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              {filteredLogs.length} Entries Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system audit trail tracking student record alterations, grade submissions, approvals, and security events.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, details, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
          >
            <option value="ALL">All Modules</option>
            <option value="Student Registry">Student Registry</option>
            <option value="Course Enrollment">Course Enrollment</option>
            <option value="Gradebook">Gradebook</option>
            <option value="Academic Records">Academic Records</option>
            <option value="RBAC & Users">RBAC & Users</option>
            <option value="System Settings">System Settings</option>
            <option value="Backup & Recovery">Backup & Recovery</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
          >
            <option value="ALL">All Severities</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User & Persona</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details / Modifications</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">{log.role.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">{log.module}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-md">
                    <p className="line-clamp-2">{log.details}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-[11px] tabular-nums">
                    {log.ipAddress}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : log.severity === 'Warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
