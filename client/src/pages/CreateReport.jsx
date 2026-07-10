import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Camera, MapPin, FileText, CheckCircle, ChevronRight, Navigation, Upload, Loader2, Brain, Sparkles, X } from 'lucide-react';

const STEPS = [
  { id:1, label:'Photo',    icon:Camera,      desc:'Capture the issue' },
  { id:2, label:'Location', icon:MapPin,       desc:'Where is it?' },
  { id:3, label:'Details',  icon:FileText,     desc:'Add context' },
  { id:4, label:'Submit',   icon:CheckCircle,  desc:'Review & send' },
];

export default function CreateReport() {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locating, setLocating] = useState(false);
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [drag, setDrag] = useState(false);
  const navigate = useNavigate();

  const pickFile = (file) => {
    if (!file) return;
    if (file.size > 20*1024*1024) { toast.error('Max 20 MB'); return; }
    setPhoto(file); setPreview(URL.createObjectURL(file));
  };

  const gps = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p => { setLat(p.coords.latitude.toFixed(6)); setLng(p.coords.longitude.toFixed(6)); setLocating(false); toast.success('Location captured!'); },
      ()  => { toast.error('Could not get location'); setLocating(false); }
    );
  };

  const submit = async () => {
    const fd = new FormData();
    fd.append('photo', photo); fd.append('latitude', lat); fd.append('longitude', lng); fd.append('description', desc);
    setSubmitting(true);
    try {
      const r = await submitReport(fd);
      toast.success('Report submitted! AI is analysing…');
      navigate(`/report/${r.data.data.reportId}`);
    } catch(e) { toast.error(e.response?.data?.error?.message||'Submission failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen relative" style={{background:'var(--bg-primary)'}}>
      <div className="mesh-bg"/>
      <div className="orb orb-cyan w-[400px] h-[400px] top-0 right-[-10%] opacity-[0.06]" style={{animationDuration:'22s'}}/>
      <div className="relative z-10">
        <Navbar/>
        <div className="max-w-2xl mx-auto px-5 py-8">

          {/* Header */}
          <div className="mb-8 anim-fade-up">
            <span className="badge badge-blue mb-3 text-xs"><Sparkles className="w-3 h-3"/>New Report</span>
            <h1 className="text-3xl font-bold text-white">Report a Civic Issue</h1>
            <p className="text-[--text-secondary] mt-1">Our AI will classify, assess severity and route to the right department automatically.</p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center mb-8 anim-fade-up delay-1">
            {STEPS.map((s,i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    step>s.id ? 'gradient-success glow-green' : step===s.id ? 'gradient-brand glow-blue' : 'bg-white/[0.06]'}`}>
                    {step>s.id ? <CheckCircle className="w-4 h-4 text-white"/> : <s.icon className={`w-4 h-4 ${step===s.id?'text-white':'text-[--text-secondary]'}`}/>}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-semibold uppercase tracking-wide ${step===s.id?'text-sky-400':step>s.id?'text-emerald-400':'text-[--text-secondary]'}`}>{s.label}</span>
                </div>
                {i<STEPS.length-1 && <div className={`flex-1 h-px mx-2 mb-4 transition-all duration-500 ${step>s.id?'bg-emerald-500/40':'bg-white/[0.08]'}`}/>}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="glass rounded-3xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] border border-white/[0.07] anim-scale-in">

            {/* ── Step 1 ── */}
            {step===1 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Upload Photo</h2>
                <p className="text-[--text-secondary] text-sm mb-5">A clear photo helps our AI identify the issue accurately.</p>
                <div
                  onDrop={e=>{e.preventDefault();setDrag(false);pickFile(e.dataTransfer.files[0]);}}
                  onDragOver={e=>{e.preventDefault();setDrag(true);}}
                  onDragLeave={()=>setDrag(false)}
                  onClick={()=>!preview&&document.getElementById('file-in').click()}
                  className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden cursor-pointer
                    ${drag?'border-blue-400 bg-blue-500/[0.08]':'border-white/[0.1] hover:border-white/[0.2] bg-white/[0.02]'}`}
                  style={{minHeight:'220px'}}>
                  {preview ? (
                    <div className="relative">
                      <img src={preview} className="w-full h-56 object-cover" alt=""/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                      <button onClick={e=>{e.stopPropagation();setPhoto(null);setPreview(null);}} className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                        <X className="w-4 h-4 text-white"/>
                      </button>
                      <p className="absolute bottom-3 left-3 text-xs text-white/80 font-medium">{photo?.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                      <div className="w-14 h-14 rounded-2xl glass-md flex items-center justify-center mb-4 float-anim">
                        <Upload className="w-6 h-6 text-[--text-secondary]"/>
                      </div>
                      <p className="text-white font-semibold mb-1">Drop photo here or click to browse</p>
                      <p className="text-xs text-[--text-secondary]">JPEG · PNG · WEBP · Max 20 MB</p>
                    </div>
                  )}
                  <input id="file-in" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>pickFile(e.target.files[0])} className="hidden"/>
                </div>
                {!preview && <button onClick={()=>document.getElementById('file-in').click()} className="btn btn-secondary w-full mt-3">
                  <Camera className="w-4 h-4"/>Browse Files
                </button>}
                <button onClick={()=>setStep(2)} disabled={!photo} className="btn btn-primary btn-lg w-full mt-4 glow-blue">
                  Continue <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step===2 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Set Location</h2>
                <p className="text-[--text-secondary] text-sm mb-5">Accurate location helps route your report to the right local authority.</p>
                <button onClick={gps} disabled={locating}
                  className="btn w-full mb-4 py-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] text-white text-sm font-semibold transition-all">
                  {locating ? <><Loader2 className="w-4 h-4 animate-spin"/>Detecting…</> : <><Navigation className="w-4 h-4 text-cyan-400"/>Use My GPS Location</>}
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 divider"/><span className="text-xs text-[--text-secondary]">or enter manually</span><div className="flex-1 divider"/>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[['Latitude','lat',lat,setLat,'28.6139'],['Longitude','lng',lng,setLng,'77.2090']].map(([l,_k,v,sv,ph])=>(
                    <div key={l}>
                      <label className="block text-xs font-semibold text-[--text-secondary] uppercase tracking-widest mb-2">{l}</label>
                      <input type="number" step="any" value={v} onChange={e=>sv(e.target.value)} placeholder={ph} className="input font-mono text-sm"/>
                    </div>
                  ))}
                </div>
                {lat&&lng&&(
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 mb-1">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
                    <span className="text-xs font-mono text-emerald-400">{lat}, {lng}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-auto"/>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={()=>setStep(1)} className="btn btn-secondary">Back</button>
                  <button onClick={()=>setStep(3)} disabled={!lat||!lng} className="btn btn-primary glow-blue">Continue <ChevronRight className="w-4 h-4"/></button>
                </div>
              </div>
            )}

            {/* ── Step 3 ── */}
            {step===3 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Add Details</h2>
                <p className="text-[--text-secondary] text-sm mb-5">Optional but improves AI accuracy.</p>
                <label className="block text-xs font-semibold text-[--text-secondary] uppercase tracking-widest mb-2">Description</label>
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe the issue — size, duration, potential hazard, affected area…"
                  className="input resize-none mb-4" rows={5}/>
                <div className="rounded-2xl p-4 bg-blue-500/[0.07] border border-blue-500/[0.15] mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-400"/>
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">AI will automatically</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs text-blue-300/70">
                    {['Classify issue type','Estimate severity','Route to department','Detect duplicates','Generate summary','Score priority'].map(t=>(
                      <span key={t} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-blue-400"/>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>setStep(2)} className="btn btn-secondary">Back</button>
                  <button onClick={()=>setStep(4)} className="btn btn-primary glow-blue">Review <ChevronRight className="w-4 h-4"/></button>
                </div>
              </div>
            )}

            {/* ── Step 4 ── */}
            {step===4 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Review & Submit</h2>
                <p className="text-[--text-secondary] text-sm mb-5">Verify everything looks correct before submitting.</p>
                <div className="space-y-3 mb-5">
                  <div className="glass-md rounded-2xl p-3 flex gap-3 items-center">
                    <img src={preview} className="w-14 h-14 rounded-xl object-cover flex-shrink-0"/>
                    <div>
                      <p className="text-xs text-[--text-secondary] uppercase tracking-wider mb-0.5">Photo</p>
                      <p className="text-sm text-white font-medium truncate max-w-[180px]">{photo?.name}</p>
                      <p className="text-xs text-[--text-secondary]">{(photo?.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="glass-md rounded-2xl p-3 flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl gradient-cyan flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white"/>
                    </div>
                    <div>
                      <p className="text-xs text-[--text-secondary] uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-sm font-mono text-white">{lat}, {lng}</p>
                    </div>
                  </div>
                  {desc && (
                    <div className="glass-md rounded-2xl p-3">
                      <p className="text-xs text-[--text-secondary] uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm text-white">{desc}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>setStep(3)} className="btn btn-secondary">Back</button>
                  <button onClick={submit} disabled={submitting} className="btn btn-primary btn-lg glow-blue">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin"/>Submitting…</> : <><CheckCircle className="w-4 h-4"/>Submit Report</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
