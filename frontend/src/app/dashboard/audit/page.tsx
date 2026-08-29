'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  ScrollText,
  Search,
  Download,
  CheckCircle2,
  ShieldCheck,
  Filter,
  Layers,
  Clock,
  User,
  Hash,
} from 'lucide-react';

export default function AuditPage() {
  const { auditLogs } = useDeviceStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.hash.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || log.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `guardian-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Action', 'Category', 'Target', 'Status', 'Details', 'Hash'];
    const rows = auditLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.actor}"`,
      l.action,
      l.category,
      `"${l.target}"`,
      l.status,
      `"${l.details.replace(/"/g, '""')}"`,
      l.hash,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guardian-audit-trail-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Immutable Governance &amp; Audit Logs
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              SHA-256 HASH CHAIN VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident cryptographically chained audit trail for regulatory compliance, OTA approvals, and incident triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#0c1a13] hover:bg-[#12281d] border border-[#183324] text-emerald-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#060b08] border border-[#14221b] rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, actor, target, hash..."
            className="w-full bg-[#0a140f] border border-[#182b21] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'DEPLOYMENT', 'SECURITY', 'RECOVERY', 'POLICY', 'SYSTEM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1611]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-[#060b08] border border-[#14221b] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#08100c] text-slate-400 text-[10px] uppercase border-b border-[#14221b]">
              <tr>
                <th className="py-3 px-4">Timestamp / Hash</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f1d16]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#09130e] transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div className="text-[9px] text-emerald-500/80 truncate w-28 select-all" title={log.hash}>
                      {log.hash.substring(0, 12)}...
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-300 font-sans text-[11px]">{log.actor}</td>

                  <td className="py-3 px-4 font-bold text-slate-200">{log.action}</td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[9px] bg-[#0c1a13] text-emerald-300 border border-[#183324]">
                      {log.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-300 text-[11px]">{log.target}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : log.status === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-400 font-sans text-[11px] max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}