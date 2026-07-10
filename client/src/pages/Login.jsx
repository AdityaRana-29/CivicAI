import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react';

const DEMOS = [
  { role: 'citizen',       label: 'Citizen',    email: 'citizen@civicai.com',   pass: 'citizen123', color: 'badge-blue',   desc: 'Submit & track reports' },
  { role: 'authority',     label: 'Authority',  email: 'authority@civicai.com', pass: 'auth123',    color: 'badge-purple', desc: 'Manage & resolve issues' },
  { role: 'administrator', label: 'Admin',      email: 'admin@civicai.com',     pass: 'admin123',   color: 'badge-green',  desc: 'Full analytics access' },
];

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const { signin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      signin(res.data.data.user, res.data.data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" style={{background:'var(--bg-primary)'}}>
      <div className="mesh-bg" />
      {/* Orbs */}
      <div className="orb orb-blue  w-[500px] h-[500px] top-[-15%] left-[-10%]" style={{animationDuration:'25s'}} />
      <div className="orb orb-purple w-[400px] h-[400px] bottom-[-15%] right-[-8%]" style={{animationDuration:'30s',animationDelay:'5s'}} />
      <div className="orb orb-cyan   w-[300px] h-[300px] top-[40%] left-[55%]"  style={{animationDuration:'20s',animationDelay:'10s'}} />

      <div className="relative z-10 w-full max-w-[1000px] mx-auto grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden xl:flex flex-col justify-between gap-6 rounded-[2rem] glass p-10 shadow-[0_32px_90px_rgba(0,0,0,0.45)] border border-white/[0.08]">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl gradient-brand glow-blue mb-5">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">Secure, simple, and smart civic reporting.</h1>
            <p className="text-[--text-secondary] text-base leading-7">Log in to manage reports, track issues, and see local impact with an elegant dashboard designed for faster decisions.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-3xl bg-white/10 flex items-center justify-center text-sky-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Quick access to live reports</p>
                <p className="text-sm text-[--text-secondary]">Jump to updates and follow the progress of community issues.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-3xl bg-white/10 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Modern, responsive design</p>
                <p className="text-sm text-[--text-secondary]">Accessible UI with clean layouts for every screen size.</p>
              </div>
            </div>
          </div>

          <div className="glass-md rounded-[1.75rem] p-5 border border-white/[0.06]">
            <p className="text-sm font-semibold text-white mb-3">Need an account?</p>
            <p className="text-sm text-[--text-secondary]">Register in seconds and start reporting civic issues instantly.</p>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-8 shadow-[0_32px_90px_rgba(0,0,0,0.45)] border border-white/[0.08] anim-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand glow-blue mb-4 float-anim">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient-brand mb-1">CivicAI</h1>
            <p className="text-[--text-secondary] text-sm">AI-powered civic infrastructure reporting</p>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-[--text-secondary] text-sm mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[--text-secondary] uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]" />
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[--text-secondary] uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]" />
                <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="input pl-10 pr-10" required />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[--text-secondary] hover:text-white transition-colors">
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-1 glow-blue">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{animation:'spin 0.8s linear infinite'}} />
                : <><span>Sign In</span><ArrowRight className="w-4 h-4"/></>
              }
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 divider"/>
              <span className="text-xs text-[--text-secondary] flex items-center gap-1"><Sparkles className="w-3 h-3"/>Demo accounts</span>
              <div className="flex-1 divider"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMOS.map(d => (
                <button key={d.role} type="button" onClick={() => { setEmail(d.email); setPassword(d.pass); toast.success(`Loaded ${d.label} demo`); }}
                  className="glass-md rounded-2xl p-4 text-left hover:bg-white/[0.08] transition-all hover:-translate-y-0.5 border border-white/[0.06]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`badge text-[10px] ${d.color}`}>{d.label}</span>
                    <span className="text-[10px] text-[--text-secondary] uppercase tracking-[0.16em]">Use</span>
                  </div>
                  <p className="text-[11px] text-[--text-secondary] leading-snug">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-[--text-secondary] mt-5">
            No account? <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">Register here</Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[--text-secondary]/50 mt-6">Powered by GPT-4o Vision · MongoDB · React</p>
      </div>
    </div>
  );
}
