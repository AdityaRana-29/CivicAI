import { Link } from 'react-router-dom';
import { StatusBadge, SeverityBadge } from './StatusBadge';
import { ChevronRight, Users, Star, Layers, AlertTriangle } from 'lucide-react';

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ReportTable({ reports = [] }) {
  const sorted = [...reports].sort(
    (a, b) => (SEV_ORDER[a.severityLevel] ?? 4) - (SEV_ORDER[b.severityLevel] ?? 4)
  );

  if (sorted.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-dashed border-white/[0.08]">
        <p className="text-white font-semibold mb-1">No reports found</p>
        <p className="text-[--text-secondary] text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden border border-sky-500/[0.08]">
      {/* Header */}
      <div className="grid grid-cols-[56px_1fr_100px_120px_130px_100px_80px_40px] gap-4 px-4 py-2.5 border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-widest text-[--text-secondary]">
        <span></span>
        <span>Issue</span>
        <span>Severity</span>
        <span>Status</span>
        <span>Department</span>
        <span>Citizen</span>
        <span>Date</span>
        <span></span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {sorted.map((r, i) => (
          <Link key={r._id} to={`/report/${r._id}`}
            className={`grid grid-cols-[56px_1fr_100px_120px_130px_100px_80px_40px] gap-4 px-4 py-3 items-center hover:bg-sky-500/[0.04] transition-colors group
              ${r.severityLevel === 'critical' ? 'bg-red-500/[0.03] border-l-2 border-red-500/40' : ''}`}
            style={{ animationDelay: `${i * 0.03}s` }}>

            {/* Photo */}
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/[0.07] flex-shrink-0">
              <img src={r.photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="" />
            </div>

            {/* Issue info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-sm font-semibold text-white capitalize leading-tight">
                  {r.issueType?.replace(/_/g, ' ')}
                </span>
                {r.severityLevel === 'critical' && (
                  <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                )}
                {r.isDuplicate && (
                  <span className="badge badge-purple text-[9px] py-0 px-1.5">
                    <Layers className="w-2 h-2" />dup
                  </span>
                )}
                {r.lowPriority && (
                  <span className="badge badge-red text-[9px] py-0 px-1.5">low priority</span>
                )}
                {r.needsManualReview && (
                  <span className="badge badge-orange text-[9px] py-0 px-1.5">review</span>
                )}
              </div>
              <p className="text-xs text-[--text-secondary] truncate max-w-xs">
                {r.aiSummary || 'AI processing…'}
              </p>
            </div>

            {/* Severity */}
            <div><SeverityBadge severity={r.severityLevel} /></div>

            {/* Status */}
            <div><StatusBadge status={r.status} /></div>

            {/* Department */}
            <div className="text-xs text-[--text-secondary] truncate">
              {r.department?.name || '—'}
            </div>

            {/* Citizen */}
            <div>
              {r.submittedBy && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[--text-secondary] flex-shrink-0" />
                  <span className="text-xs text-[--text-secondary] truncate">{r.submittedBy.name}</span>
                  {r.submittedBy.reputationScore !== undefined && (
                    <span className={`text-[10px] font-bold flex-shrink-0 flex items-center gap-0.5 ${r.submittedBy.reputationScore < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                      <Star className="w-2.5 h-2.5" />
                      {r.submittedBy.reputationScore}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="text-[11px] text-[--text-secondary]">
              {new Date(r.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-white/[0.15] group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
