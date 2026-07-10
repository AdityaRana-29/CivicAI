import { useQuery } from '@tanstack/react-query';
import { getMyReports } from '../services/api';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText, CheckCircle, Clock, AlertTriangle, ChevronRight, MapPin, Calendar, Brain, Layers, Star, TrendingUp, Zap, Activity } from 'lucide-react';

const STATUS = {
  submitted:    { label:'Submitted',    cls:'badge-blue',   dot:'bg-sky-400' },
  under_review: { label:'Under Review', cls:'badge-yellow', dot:'bg-yellow-400' },
  in_progress:  { label:'In Progress',  cls:'badge-orange', dot:'bg-orange-400' },
  resolved:     { label:'Resolved',     cls:'badge-green',  dot:'bg-emerald-400' },
  closed:       { label:'Closed',       cls:'badge-gray',   dot:'bg-gray-500' },
};
const SEV = {
  low:      { cls:'badge-green',  bar:'from-emerald-500 to-teal-400',   w:'25%' },
  medium:   { cls:'badge-yellow', bar:'from-yellow-500 to-amber-400',   w:'55%' },
  high:     { cls:'badge-orange', bar:'from-orange-500 to-red-400',     w:'78%' },
  critical: { cls:'badge-red',    bar:'from-red-500 to-pink-500',       w:'100%', pulse:true },
};

function StatCard({ label, value, icon: Icon, gradient, delay }) {
  return (
    <div className={`glass card p-5 hover-glow anim-fade-up ${delay}`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-sm text-[--text-secondary] mt-1">{label}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-4 flex gap-4">
      <div className="w-16 h-16 rounded-xl shimmer-line flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 shimmer-line rounded w-2/3" />
        <div className="h-3 shimmer-line rounded w-full" />
        <div className="h-3 shimmer-line rounded w-1/2" />
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['myReports'],
    queryFn: async () => { const r = await getMyReports(); return r.data.data; },
  });

  const stats = [
    { label:'Total Reports',   value: reports.length,                                           icon: FileText,       gradient:'from-sky-500 to-cyan-400',   delay:'delay-1' },
    { label:'Resolved',        value: reports.filter(r=>r.status==='resolved').length,           icon: CheckCircle,    gradient:'from-emerald-500 to-teal-400', delay:'delay-2' },
    { label:'Active',          value: reports.filter(r=>['in_progress','under_review'].includes(r.status)).length, icon: Activity, gradient:'from-amber-500 to-orange-400', delay:'delay-3' },
    { label:'Critical Issues', value: reports.filter(r=>r.severityLevel==='critical').length,    icon: AlertTriangle,  gradient:'from-red-500 to-pink-500',     delay:'delay-4' },
  ];

  const resolved = reports.filter(r=>r.status==='resolved').length;
  const resolvedPct = reports.length ? Math.round((resolved/reports.length)*100) : 0;

  return (
    <div className="min-h-screen relative" style={{background:'var(--bg-primary)'}}>
      <div className="mesh-bg" />
      <div className="orb orb-blue w-[600px] h-[600px] top-[-20%] right-[-15%] opacity-[0.06]" style={{animationDuration:'30s'}} />
      <div className="orb orb-purple w-[400px] h-[400px] bottom-0 left-[-10%] opacity-[0.05]" style={{animationDuration:'25s'}} />

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-5 py-8">
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 anim-fade-up">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-blue text-xs"><Zap className="w-3 h-3"/>Citizen Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Hello, <span className="text-gradient-brand">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-[--text-secondary] mt-1.5">Your civic reports at a glance</p>
            </div>
            <Link to="/report/new" className="btn btn-primary btn-lg glow-blue self-start sm:self-auto">
              <Plus className="w-4 h-4"/>Report Issue
            </Link>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s,i)=><StatCard key={i} {...s}/>)}
          </div>

          {/* ── Progress Banner ── */}
          <div className="glass-md rounded-2xl p-5 mb-6 border border-white/[0.07] anim-fade-up delay-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400"/>
                <span className="text-sm font-semibold text-white">Resolution Rate</span>
              </div>
              <span className="text-2xl font-bold text-gradient-green">{resolvedPct}%</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 progress-bar"
                style={{width:`${resolvedPct}%`, transition:'width 1s ease'}} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[--text-secondary]">
              <span>{resolved} resolved</span>
              <span>{reports.length - resolved} pending</span>
            </div>
          </div>

          {/* ── Reports ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[--text-secondary]"/>All Reports
                <span className="text-sm font-normal text-[--text-secondary]">({reports.length})</span>
              </h2>
            </div>

            {isLoading && <div className="space-y-3">{[1,2,3].map(i=><SkeletonCard key={i}/>)}</div>}

            {!isLoading && reports.length === 0 && (
              <div className="glass rounded-3xl p-16 text-center border border-dashed border-white/[0.1]">
                <div className="w-20 h-20 rounded-3xl glass-md flex items-center justify-center mx-auto mb-5 float-anim">
                  <FileText className="w-9 h-9 text-[--text-secondary]"/>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No reports yet</h3>
                <p className="text-[--text-secondary] text-sm mb-6 max-w-xs mx-auto">Be the first in your area to make a difference. Report a civic issue now.</p>
                <Link to="/report/new" className="btn btn-primary btn-lg glow-blue">
                  <Plus className="w-4 h-4"/>Create Your First Report
                </Link>
              </div>
            )}

            <div className="space-y-3">
              {reports.map((r, i) => {
                const st = STATUS[r.status] || STATUS.submitted;
                const sv = SEV[r.severityLevel] || SEV.low;
                return (
                  <Link key={r._id} to={`/report/${r._id}`}
                    className="glass card hover-glow flex gap-4 p-4 group anim-fade-up"
                    style={{animationDelay:`${i*0.05}s`}}>
                    {/* Thumb */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/[0.08]">
                      <img src={r.photoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/>
                    </div>
                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm capitalize leading-snug">{r.issueType?.replace(/_/g,' ')}</h3>
                        <span className={`badge text-[10px] flex-shrink-0 ${st.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${sv.pulse?'animate-pulse':''}`}/>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-[--text-secondary] line-clamp-1 mb-2">{r.aiSummary||'AI is processing...'}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`badge text-[10px] ${sv.cls}`}>{r.severityLevel}</span>
                        {r.isDuplicate && <span className="badge badge-purple text-[10px]"><Layers className="w-2.5 h-2.5"/>Linked</span>}
                        {r.department && <span className="text-[11px] text-[--text-secondary]">{r.department.name}</span>}
                        <span className="text-[11px] text-[--text-secondary] flex items-center gap-1 ml-auto">
                          <Calendar className="w-3 h-3"/>{new Date(r.createdAt).toLocaleDateString('en',{month:'short',day:'numeric'})}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/[0.2] group-hover:text-white/60 transition-colors flex-shrink-0 mt-1"/>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
