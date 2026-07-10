import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react';

export default function Register() {
  const [name,setName]=useState('');const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const {signin}=useAuth();const navigate=useNavigate();

  const handle=async(e)=>{
    e.preventDefault();setLoading(true);
    try{const r=await apiRegister({name,email,password,role:'citizen'});signin(r.data.data.user,r.data.data.token);toast.success('Account created!');navigate('/');}
    catch(e){toast.error(e.response?.data?.error?.message||'Registration failed');}
    finally{setLoading(false);}
  };

  return(
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" style={{background:'var(--bg-primary)'}}>
      <div className="mesh-bg"/>
      <div className="orb orb-green   w-[500px] h-[500px] top-[-15%] right-[-10%]" style={{animationDuration:'25s'}}/>
      <div className="orb orb-blue    w-[400px] h-[400px] bottom-[-15%] left-[-8%]" style={{animationDuration:'30s',animationDelay:'8s'}}/>
      <div className="relative z-10 w-full max-w-[1000px] mx-auto grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden xl:flex flex-col justify-between gap-6 rounded-[2rem] glass p-10 shadow-[0_32px_90px_rgba(0,0,0,0.45)] border border-white/[0.08]">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl gradient-brand glow-blue mb-5">
              <Shield className="w-7 h-7 text-white"/>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">Join the local movement.</h1>
            <p className="text-[--text-secondary] text-base leading-7">Create an account and start reporting issues with intelligent support and better follow-up tracking.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-3xl bg-white/10 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Community-driven visibility</p>
                <p className="text-sm text-[--text-secondary]">Help authorities identify and fix the places that matter most.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-3xl bg-white/10 flex items-center justify-center text-violet-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Secure access</p>
                <p className="text-sm text-[--text-secondary]">Your profile and report history remain safe, private, and trusted.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="glass rounded-[2rem] p-8 shadow-[0_32px_90px_rgba(0,0,0,0.45)] border border-white/[0.07]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand glow-blue mb-4 float-anim"><Shield className="w-7 h-7 text-white"/></div>
            <h1 className="text-4xl font-bold text-gradient-brand mb-1">CivicAI</h1>
            <p className="text-[--text-secondary] text-sm">Join thousands making a difference</p>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
          <p className="text-[--text-secondary] text-sm mb-6">Free forever · No credit card needed</p>
          <form onSubmit={handle} className="space-y-4">
            {[
              {icon:User, state:name, set:setName, type:'text', label:'Full Name', ph:'Your name'},
              {icon:Mail, state:email, set:setEmail, type:'email', label:'Email', ph:'you@example.com'},
            ].map(({icon:Icon,state,set,type,label,ph})=>(
              <div key={label}>
                <label className="block text-xs font-semibold text-[--text-secondary] uppercase tracking-widest mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]"/>
                  <input type={type} value={state} onChange={e=>set(e.target.value)} placeholder={ph} className="input pl-10" required/>
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-[--text-secondary] uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]"/>
                <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 6 characters" className="input pl-10 pr-10" required minLength={6}/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[--text-secondary] hover:text-white transition-colors">
                  {show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-1 glow-blue">
              {loading?<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{animation:'spin 0.8s linear infinite'}}/>:<><span>Create Account</span><ArrowRight className="w-4 h-4"/></>}
            </button>
          </form>
          <p className="text-center text-sm text-[--text-secondary] mt-5">
            Have an account? <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
