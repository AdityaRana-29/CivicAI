import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReport, updateReportStatus, flagReport as apiFlagReport } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Calendar, Building2, User, Star, Brain, CheckCircle, Clock, Copy, Layers, Flag, Loader2, AlertTriangle, Zap, TrendingUp } from 'lucide-react';

const SEV = {
  low:      { cls:'badge-green',   bar:'from-emerald-500 to-teal-400',   glow:'',               label:'Low',      pct:22 },
  medium:   { cls:'badge-yellow',  bar:'from-yellow-500 to-amber-400',   glow:'',               label:'Medium',   pct:55 },
  high:     { cls:'badge-orange',  bar:'from-orange-500 to-red-400',     glow:'',               label:'High',     pct:78 },
  critical: { cls:'badge-red',     bar:'from-red-500 to-pink-500',       glow:'glow-red',       label:'Critical', pct:100, pulse:true },
};
const STAT = {
  submitted:    { cls:'badge-blue',   label:'Submitted',    icon:Clock },
  under_review: { cls:'badge-yellow', label:'Under Review', icon:TrendingUp },
  in_progress:  { cls:'badge-orange', label:'In Progress',  icon:Zap },
  resolved:     { cls:'badge-green',  label:'Resolved',     icon:CheckCircle },
  closed:       { cls:'badge-gray',   label:'Closed',       icon:Flag },
};

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  const { data:report, isLoading } = useQuery({
    queryKey:['report',id],
    queryFn: async()=>{ const r=await getReport(id); return r.data.data; },
  });

  const statusMut = useMutation({
    mutationFn: ()=>updateReportStatus(id,{status:newStatus,notes}),
    onSuccess: ()=>{ toast.success('Status updated'); qc.invalidateQueries(['report',id]); setNotes(''); setNewStatus(''); },
    onError: e=>toast.error(e.response?.data?.error?.message||'Failed'),
  });
  const flagMut = useMutation({
    mutationFn: ()=>apiFlagReport(id),
    onSuccess: ()=>{ toast.success('Flagged as spam'); qc.invalidateQueries(['report',id]); },
    onError: e=>toast.error(e.response?.data?.error?.message||'Failed'),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-primary)'}}>
      <div className="w-10 h-10 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin"/>
    </div>
  );
  if (!report) return null;

  const sv = SEV[report.severityLevel]||SEV.low;
  const st = STAT[report.status]||STAT.submitted;
  const canManage = ['authority','administrator'].includes(user?.role);

  return (
    <div className="min-h-screen relative" style={{background:'var(--bg-primary)'}}>
      <div className="mesh-bg"/>
      <div className="relative z-10">
        <Navbar/>
        <div className="max-w-5xl mx-auto px-5 py-8">

          {/* Back */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"/>Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6 anim-fade-up">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{report.issueType?.replace(/_/g,' ')}</h1>
              <p className="text-xs font-mono text-[--text-secondary] mt-1 cursor-pointer hover:text-white transition-colors"
                onClick={()=>{navigator.clipboard.writeText(report._id);toast.success('ID copied');}}>
                #{report._id} <Copy className="w-3 h-3 inline ml-1"/>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${sv.cls} ${sv.glow}`}>{sv.label}</span>
              <span className={`badge ${st.cls}`}><st.icon className="w-3 h-3"/>{st.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* LEFT */}
            <div className="space-y-4">
              {/* Photo */}
              <div className="glass rounded-3xl overflow-hidden anim-scale-in ring-1 ring-white/[0.07]">
                <img src={report.photoUrl} className="w-full h-72 object-cover" alt="Issue"/>
                {sv.pulse && <div className="h-0.5 w-full gradient-danger animate-pulse"/>}
              </div>

              {/* Severity bar */}
              <div className="glass rounded-2xl p-5 anim-fade-up delay-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-white flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-[--text-secondary]"/>Severity</span>
                  <span className={`badge ${sv.cls}`}>{sv.label}</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${sv.bar} progress-bar ${sv.pulse?'animate-pulse':''}`} style={{width:`${sv.pct}%`}}/>
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-[--text-secondary]">
                  <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
                </div>
              </div>

              {/* AI Summary */}
              {report.aiSummary && (
                <div className="glass rounded-2xl p-5 border border-sky-500/[0.18] anim-fade-up delay-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-sky-400"/>
                    </div>
                    <span className="text-sm font-bold text-sky-300">AI Analysis</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{report.aiSummary}</p>
                </div>
              )}

              {/* Alerts */}
              {report.isDuplicate && (
                <div className="glass rounded-2xl p-4 border border-violet-500/20 anim-fade-up delay-3">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-violet-400 flex-shrink-0"/>
                    <p className="text-sm text-violet-300">Linked to issue <span className="font-mono text-xs bg-violet-500/20 px-1.5 py-0.5 rounded">#{report.duplicateOf?._id||report.duplicateOf}</span></p>
                  </div>
                </div>
              )}

              {report.resolutionNotes && (
                <div className="glass rounded-2xl p-5 border border-emerald-500/20 anim-fade-up delay-3">
                  <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-400"/><span className="text-sm font-bold text-emerald-300">Resolved</span></div>
                  <p className="text-sm text-white/80">{report.resolutionNotes}</p>
                  <p className="text-xs text-[--text-secondary] mt-1.5">{new Date(report.resolvedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {/* Meta */}
              <div className="glass rounded-2xl p-5 anim-slide-r">
                <h3 className="text-xs font-bold text-[--text-secondary] uppercase tracking-widest mb-4">Report Details</h3>
                <div className="space-y-3.5">
                  {[
                    { icon:Building2, label:'Department', value:report.department?.name||'Unassigned', cls:'text-violet-300' },
                    { icon:Calendar, label:'Submitted', value:new Date(report.createdAt).toLocaleString('en',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}), cls:'text-white/80' },
                    { icon:MapPin, label:'Coordinates', value:`${report.location?.coordinates?.[1]?.toFixed(5)}, ${report.location?.coordinates?.[0]?.toFixed(5)}`, cls:'text-cyan-300 font-mono text-xs' },
                    ...(report.submittedBy?[{ icon:User, label:'Reported by', value:report.submittedBy.name, cls:'text-white/80' }]:[]),
                  ].map(({icon:Icon,label,value,cls})=>(
                    <div key={label} className="flex gap-3">
                      <Icon className="w-4 h-4 text-[--text-secondary] flex-shrink-0 mt-0.5"/>
                      <div><p className="text-[10px] text-[--text-secondary] uppercase tracking-wider mb-0.5">{label}</p><p className={`text-sm ${cls}`}>{value}</p></div>
                    </div>
                  ))}
                  {report.submittedBy?.reputationScore!==undefined && (
                    <div className="flex gap-3">
                      <Star className="w-4 h-4 text-[--text-secondary] flex-shrink-0 mt-0.5"/>
                      <div className="flex-1">
                        <p className="text-[10px] text-[--text-secondary] uppercase tracking-wider mb-1.5">Reputation</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full progress-bar ${report.submittedBy.reputationScore<10?'bg-red-400':report.submittedBy.reputationScore<50?'bg-amber-400':'bg-emerald-400'}`}
                              style={{width:`${report.submittedBy.reputationScore}%`}}/>
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ${report.submittedBy.reputationScore<10?'text-red-400':'text-emerald-400'}`}>
                            {report.submittedBy.reputationScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {report.duplicateCount>0 && (
                    <div className="flex items-center gap-2 p-2.5 bg-violet-500/[0.08] border border-violet-500/20 rounded-xl mt-1">
                      <Layers className="w-3.5 h-3.5 text-violet-400"/><span className="text-xs text-violet-300">{report.duplicateCount} duplicate report(s) merged</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="glass rounded-2xl p-5 anim-slide-r delay-1">
                <h3 className="text-xs font-bold text-[--text-secondary] uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5"/>Status Timeline
                </h3>
                <div className="relative pl-5">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/[0.08]"/>
                  <div className="space-y-4">
                    {report.statusHistory?.map((e,i)=>{
                      const s=STAT[e.status]||STAT.submitted;
                      return (
                        <div key={i} className="relative">
                          <div className="absolute -left-[1.15rem] top-0.5 w-3 h-3 rounded-full glass-strong border border-white/20 flex items-center justify-center">
                            <div className={`w-1.5 h-1.5 rounded-full ${s.cls.includes('green')?'bg-emerald-400':s.cls.includes('blue')?'bg-sky-400':s.cls.includes('yellow')?'bg-yellow-400':s.cls.includes('orange')?'bg-orange-400':'bg-gray-400'}`}/>
                          </div>
                          <p className={`text-xs font-bold uppercase tracking-wide mb-0.5`} style={{color:s.cls.includes('green')?'#34d399':s.cls.includes('blue')?'#38bdf8':s.cls.includes('yellow')?'#fbbf24':s.cls.includes('orange')?'#fb923c':'#9ca3af'}}>
                            {e.status?.replace(/_/g,' ')}
                          </p>
                          {e.notes&&<p className="text-xs text-[--text-secondary] mb-0.5">{e.notes}</p>}
                          <p className="text-[10px] text-[--text-secondary]/60">{new Date(e.changedAt).toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Authority actions */}
              {canManage && (
                <div className="glass rounded-2xl p-5 border border-white/[0.1] anim-slide-r delay-2">
                  <h3 className="text-xs font-bold text-[--text-secondary] uppercase tracking-widest mb-4">Update Status</h3>
                  <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="input text-sm mb-3">
                    <option value="">Select new status…</option>
                    {['under_review','in_progress','resolved','closed'].map(s=>(
                      <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Resolution notes…" className="input resize-none text-sm mb-3" rows={3}/>
                  <div className="grid grid-cols-[1fr_42px] gap-2">
                    <button onClick={()=>statusMut.mutate()} disabled={!newStatus||statusMut.isPending} className="btn btn-primary glow-blue">
                      {statusMut.isPending?<Loader2 className="w-4 h-4 animate-spin"/>:<CheckCircle className="w-4 h-4"/>}
                      Update
                    </button>
                    <button onClick={()=>window.confirm('Flag as spam?')&&flagMut.mutate()} disabled={flagMut.isPending} className="btn btn-danger h-full">
                      <Flag className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
