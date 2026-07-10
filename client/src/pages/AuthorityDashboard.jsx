import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../services/api';
import Navbar from '../components/Navbar';
import HeatmapView from '../components/HeatmapView';
import { Link } from 'react-router-dom';
import { LayoutList, Map, SlidersHorizontal, RefreshCw, ChevronRight, AlertTriangle, CheckCircle, Clock, Activity, Users, Layers, Star, X, ShieldAlert } from 'lucide-react';

const SEV_ORDER = { critical:0, high:1, medium:2, low:3 };
const SEV_BADGE = { critical:'badge-red', high:'badge-orange', medium:'badge-yellow', low:'badge-green' };
const STAT_BADGE = { submitted:'badge-blue', under_review:'badge-yellow', in_progress:'badge-orange', resolved:'badge-green', closed:'badge-gray' };

export default function AuthorityDashboard() {
  const [view, setView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ issueType:'', severityLevel:'', status:'' });

  const { data:reports=[], isLoading, refetch, isFetching } = useQuery({
    queryKey:['reports',filters],
    queryFn: async()=>{ const r=await getReports(filters); return r.data.data; },
  });

  const sorted = [...reports].sort((a,b)=>(SEV_ORDER[a.severityLevel]??4)-(SEV_ORDER[b.severityLevel]??4));
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const stats = [
    { label:'Total',      value:reports.length,                                         icon:LayoutList,     gradient:'from-sky-500 to-cyan-400' },
    { label:'Critical',   value:reports.filter(r=>r.severityLevel==='critical').length,  icon:ShieldAlert,    gradient:'from-red-500 to-pink-500' },
    { label:'In Progress',value:reports.filter(r=>r.status==='in_progress').length,      icon:Activity,       gradient:'from-amber-500 to-orange-500' },
    { label:'Resolved',   value:reports.filter(r=>r.status==='resolved').length,         icon:CheckCircle,    gradient:'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="min-h-screen relative" style={{background:'var(--bg-primary)'}}>
      <div className="mesh-bg"/>
      <div className="orb orb-purple w-[500px] h-[500px] top-[-15%] right-[-10%] opacity-[0.06]" style={{animationDuration:'28s'}}/>
      <div className="relative z-10">
        <Navbar/>
        <div className="max-w-7xl mx-auto px-5 py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 anim-fade-up">
            <div>
              <span className="badge badge-purple mb-2 text-xs"><ShieldAlert className="w-3 h-3"/>Authority Portal</span>
              <h1 className="text-3xl font-bold text-white">Issue <span className="text-gradient-brand">Dashboard</span></h1>
              <p className="text-[--text-secondary] mt-1">Manage and resolve civic reports in your jurisdiction</p>
            </div>
            <div className="flex gap-2">
              {(['list','map']).map(v=>(
                <button key={v} onClick={()=>setView(v)} className={`btn ${view===v?'btn-primary glow-blue':'btn-secondary'} capitalize`}>
                  {v==='list'?<LayoutList className="w-3.5 h-3.5"/>:<Map className="w-3.5 h-3.5"/>}{v==='list'?'Table':'Map'}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s,i)=>(
              <div key={i} className={`glass card p-5 hover-glow anim-fade-up delay-${i+1}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4`}>
                  <s.icon className="w-5 h-5 text-white"/>
                </div>
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-[--text-secondary] mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="glass-md rounded-2xl p-3.5 mb-5 anim-fade-up delay-5">
            <div className="flex items-center gap-3">
              <button onClick={()=>setShowFilters(!showFilters)}
                className={`btn btn-secondary py-1.5 text-xs rounded-xl ${activeFilters>0?'border-sky-500/40 text-sky-300':''}`}>
                <SlidersHorizontal className="w-3.5 h-3.5"/>
                Filters {activeFilters>0&&<span className="w-4 h-4 gradient-brand rounded-full flex items-center justify-center text-[9px] text-white font-bold">{activeFilters}</span>}
              </button>
              {activeFilters>0 && (
                <button onClick={()=>setFilters({issueType:'',severityLevel:'',status:''})} className="btn btn-secondary py-1.5 text-xs rounded-xl text-red-400 border-red-500/20">
                  <X className="w-3 h-3"/>Clear
                </button>
              )}
              <span className="text-xs text-[--text-secondary] ml-auto">{sorted.length} report{sorted.length!==1?'s':''}</span>
              <button onClick={refetch} disabled={isFetching} className="btn btn-secondary py-1.5 text-xs rounded-xl">
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching?'animate-spin':''}`}/>
              </button>
            </div>
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/[0.07] anim-slide-r">
                {[
                  {key:'issueType',label:'Issue Type',opts:['pothole','broken_streetlight','overflowing_garbage','fallen_tree','water_leakage','damaged_road','other']},
                  {key:'severityLevel',label:'Severity',opts:['low','medium','high','critical']},
                  {key:'status',label:'Status',opts:['submitted','under_review','in_progress','resolved','closed']},
                ].map(({key,label,opts})=>(
                  <div key={key}>
                    <label className="block text-[10px] font-semibold text-[--text-secondary] uppercase tracking-widest mb-1.5">{label}</label>
                    <select value={filters[key]} onChange={e=>setFilters(p=>({...p,[key]:e.target.value}))} className="input text-sm py-2">
                      <option value="">All</option>
                      {opts.map(o=><option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          {view==='map' && (
            <div className="glass rounded-3xl overflow-hidden border border-white/[0.07] anim-scale-in" style={{height:'560px'}}>
              <HeatmapView filters={filters}/>
            </div>
          )}

          {/* List */}
          {view==='list' && (
            <div>
              {isLoading && <div className="space-y-3">{[1,2,3,4,5].map(i=>(
                <div key={i} className="glass rounded-2xl p-4 flex gap-4">
                  <div className="w-14 h-14 rounded-xl shimmer-line flex-shrink-0"/>
                  <div className="flex-1 space-y-2"><div className="h-4 shimmer-line rounded w-1/2"/><div className="h-3 shimmer-line rounded w-3/4"/><div className="h-3 shimmer-line rounded w-1/3"/></div>
                </div>
              ))}</div>}

              {!isLoading && sorted.length===0 && (
                <div className="glass rounded-3xl p-16 text-center border border-dashed border-white/[0.08]">
                  <LayoutList className="w-12 h-12 text-[--text-secondary] mx-auto mb-3"/>
                  <p className="text-white font-semibold mb-1">No reports found</p>
                  <p className="text-[--text-secondary] text-sm">Try adjusting your filters</p>
                </div>
              )}

              <div className="space-y-2.5">
                {sorted.map((r,i)=>{
                  const sb = SEV_BADGE[r.severityLevel]||'badge-gray';
                  const stb = STAT_BADGE[r.status]||'badge-gray';
                  return (
                    <Link key={r._id} to={`/report/${r._id}`}
                      className={`glass card hover-glow flex gap-4 p-4 group anim-fade-up ${r.severityLevel==='critical'?'border border-red-500/[0.2]':''}`}
                      style={{animationDelay:`${i*0.04}s`}}>
                      <div className="relative flex-shrink-0">
                        <img src={r.photoUrl} className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/[0.07] group-hover:scale-105 transition-transform duration-300" alt=""/>
                        {r.severityLevel==='critical' && <div className="absolute -top-1 -right-1 w-3 h-3 gradient-danger rounded-full animate-pulse"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                          <span className="font-semibold text-white text-sm capitalize">{r.issueType?.replace(/_/g,' ')}</span>
                          <span className={`badge text-[10px] ${sb}`}>{r.severityLevel}</span>
                          <span className={`badge text-[10px] ${stb}`}>{r.status?.replace(/_/g,' ')}</span>
                          {r.lowPriority && <span className="badge badge-red text-[10px]"><AlertTriangle className="w-2.5 h-2.5"/>Low Priority</span>}
                          {r.isDuplicate && <span className="badge badge-purple text-[10px]"><Layers className="w-2.5 h-2.5"/>Duplicate</span>}
                        </div>
                        <p className="text-xs text-[--text-secondary] line-clamp-1 mb-2">{r.aiSummary||'Processing…'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-[--text-secondary] flex-wrap">
                          {r.department && <span>{r.department.name}</span>}
                          {r.submittedBy && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3"/>{r.submittedBy.name}
                              <span className={`font-bold ml-0.5 ${r.submittedBy.reputationScore<10?'text-red-400':'text-emerald-400'}`}>
                                <Star className="w-2.5 h-2.5 inline"/>{r.submittedBy.reputationScore}
                              </span>
                            </span>
                          )}
                          {r.duplicateCount>0 && <span className="flex items-center gap-1 text-violet-400"><Layers className="w-3 h-3"/>{r.duplicateCount} merged</span>}
                          <span className="ml-auto">{new Date(r.createdAt).toLocaleDateString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/[0.18] group-hover:text-white/50 transition-colors flex-shrink-0 mt-1"/>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
