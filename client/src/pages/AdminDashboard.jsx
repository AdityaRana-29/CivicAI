import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummary, getAnalyticsPerformance, getAnalyticsTrends, exportAnalyticsCSV } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Download, TrendingUp, BarChart3, Clock, Building2, Activity, Filter } from 'lucide-react';

const PALETTE = ['#4f8ef7','#8b5cf6','#22d3ee','#10b981','#f97316','#f43f5e','#eab308'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <p className="text-xs text-[--text-secondary] mb-2">{label}</p>
      {payload.map((p,i)=>(
        <p key={i} className="text-sm font-semibold flex items-center gap-2" style={{color:p.color}}>
          <span className="w-2 h-2 rounded-full inline-block" style={{background:p.color}}/>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function KPICard({label, value, icon:Icon, gradient, suffix='', delay}) {
  return (
    <div className={`glass card p-5 hover-glow anim-fade-up ${delay}`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white"/>
      </div>
      <div className="text-3xl font-bold text-white">{value}<span className="text-lg text-[--text-secondary] ml-1">{suffix}</span></div>
      <div className="text-sm text-[--text-secondary] mt-1">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [range, setRange] = useState({startDate:'',endDate:''});

  const { data:summary=[] } = useQuery({ queryKey:['sum',range], queryFn: async()=>{const r=await getAnalyticsSummary(range);return r.data.data;} });
  const { data:perf=[] }    = useQuery({ queryKey:['perf',range], queryFn: async()=>{const r=await getAnalyticsPerformance(range);return r.data.data;} });
  const { data:trends=[] }  = useQuery({ queryKey:['trend',range], queryFn: async()=>{const r=await getAnalyticsTrends(range);return r.data.data;} });

  const handleExport = async () => {
    try {
      const res = await exportAnalyticsCSV(range);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = Object.assign(document.createElement('a'),{href:url,download:`civicai_${Date.now()}.csv`});
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  const summaryData = summary.map(d=>({name:`${d._id.issueType?.replace(/_/g,' ')} / ${d._id.severityLevel}`, count:d.count}));
  const issueTypes  = [...new Set(trends.map(t=>t._id.issueType))];
  const dates       = [...new Set(trends.map(t=>t._id.date))].sort();
  const trendData   = dates.map(date=>{
    const pt={date};
    issueTypes.forEach(type=>{ const m=trends.find(t=>t._id.date===date&&t._id.issueType===type); pt[type]=m?.count||0; });
    return pt;
  });
  const total = summary.reduce((a,d)=>a+d.count,0);
  const avgRes = perf.length?(perf.reduce((a,d)=>a+d.avgResolutionHours,0)/perf.length).toFixed(1):'—';
  const maxPerf = perf.length?Math.max(...perf.map(d=>d.avgResolutionHours)):1;

  return (
    <div className="min-h-screen relative" style={{background:'var(--bg-primary)'}}>
      <div className="mesh-bg"/>
      <div className="orb orb-green w-[500px] h-[500px] top-[-15%] left-[-10%] opacity-[0.06]" style={{animationDuration:'28s'}}/>
      <div className="relative z-10">
        <Navbar/>
        <div className="max-w-7xl mx-auto px-5 py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 anim-fade-up">
            <div>
              <span className="badge badge-green mb-2 text-xs"><Activity className="w-3 h-3"/>Admin Analytics</span>
              <h1 className="text-3xl font-bold text-white">Municipality <span className="text-gradient-green">Insights</span></h1>
              <p className="text-[--text-secondary] mt-1">Real-time analytics across all civic departments</p>
            </div>
            <button onClick={handleExport} className="btn btn-success btn-lg glow-green self-start">
              <Download className="w-4 h-4"/>Export CSV
            </button>
          </div>

          {/* Date filter */}
          <div className="glass-md rounded-2xl p-4 mb-6 flex flex-wrap items-end gap-4 anim-fade-up delay-1">
            <Filter className="w-4 h-4 text-[--text-secondary] self-center"/>
            {[['startDate','From'],['endDate','To']].map(([k,l])=>(
              <div key={k}>
                <label className="block text-[10px] font-semibold text-[--text-secondary] uppercase tracking-widest mb-1.5">{l}</label>
                <input type="date" value={range[k]} onChange={e=>setRange(p=>({...p,[k]:e.target.value}))} className="input py-2 text-sm"/>
              </div>
            ))}
            <button onClick={()=>setRange({startDate:'',endDate:''})} className="btn btn-secondary text-xs py-2">Clear</button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            <KPICard label="Total Reports"   value={total}           icon={BarChart3}  gradient="from-sky-500 to-cyan-400"     delay="delay-1"/>
            <KPICard label="Avg Resolution"  value={avgRes}          icon={Clock}      gradient="from-violet-500 to-purple-500" delay="delay-2" suffix="h"/>
            <KPICard label="Departments"     value={perf.length}     icon={Building2}  gradient="from-emerald-500 to-teal-500" delay="delay-3"/>
            <KPICard label="Issue Types"     value={issueTypes.length} icon={TrendingUp} gradient="from-amber-500 to-orange-500"  delay="delay-4"/>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
            {/* Bar chart */}
            <div className="xl:col-span-3 glass rounded-3xl p-6 border border-white/[0.06] anim-fade-up delay-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center"><BarChart3 className="w-4 h-4 text-white"/></div>                <div><p className="text-sm font-bold text-white">Reports by Type & Severity</p><p className="text-xs text-[--text-secondary]">Distribution breakdown</p></div>
              </div>
              {summaryData.length>0?(
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={summaryData} margin={{bottom:70}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="name" tick={{fill:'#8b8ba8',fontSize:9}} angle={-40} textAnchor="end" interval={0}/>
                    <YAxis tick={{fill:'#8b8ba8',fontSize:11}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="count" radius={[6,6,0,0]} maxBarSize={40}>
                      {summaryData.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]} fillOpacity={0.85}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ):<div className="h-64 flex items-center justify-center text-[--text-secondary] text-sm">No data in range</div>}
            </div>

            {/* Performance */}
            <div className="xl:col-span-2 glass rounded-3xl p-6 border border-white/[0.06] anim-fade-up delay-3">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl gradient-cyan flex items-center justify-center"><Clock className="w-4 h-4 text-white"/></div>
                <div><p className="text-sm font-bold text-white">Department Performance</p><p className="text-xs text-[--text-secondary]">Avg resolution time</p></div>
              </div>
              {perf.length>0?(
                <div className="space-y-4">
                  {perf.map((d,i)=>{
                    const pct = maxPerf>0?(d.avgResolutionHours/maxPerf)*100:0;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-white truncate max-w-[130px]">{d.departmentName}</span>
                          <span className="text-xs text-[--text-secondary] flex-shrink-0 ml-2">{d.avgResolutionHours.toFixed(1)}h · {d.count}</span>
                        </div>
                        <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full progress-bar" style={{width:`${pct}%`,background:PALETTE[i%PALETTE.length],opacity:0.8}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ):<div className="h-40 flex items-center justify-center text-[--text-secondary] text-sm">No resolved reports yet</div>}
            </div>
          </div>

          {/* Trend Line Chart */}
          <div className="glass rounded-3xl p-6 border border-white/[0.06] anim-fade-up delay-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl gradient-success flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white"/></div>
              <div><p className="text-sm font-bold text-white">Submission Trends</p><p className="text-xs text-[--text-secondary]">Daily report volume by issue type</p></div>
            </div>
            {trendData.length>0?(
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="date" tick={{fill:'#8b8ba8',fontSize:11}}/>
                  <YAxis tick={{fill:'#8b8ba8',fontSize:11}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{paddingTop:'16px',color:'#8b8ba8',fontSize:'12px'}}/>
                  {issueTypes.map((type,i)=>(
                    <Line key={type} type="monotone" dataKey={type} name={type.replace(/_/g,' ')}
                      stroke={PALETTE[i%PALETTE.length]} strokeWidth={2} dot={false} activeDot={{r:4,strokeWidth:0}}/>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ):<div className="h-64 flex items-center justify-center text-[--text-secondary] text-sm">No trend data for this period</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
