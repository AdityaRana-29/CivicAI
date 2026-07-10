import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMyNotifications } from '../services/api';
import { Shield, Bell, Plus, LogOut, LayoutDashboard, Map, BarChart3, ChevronDown, Zap, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [dropdown, setDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try { const r = await getMyNotifications(); setUnread(r.data.data.filter(n => !n.read).length); } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  const roleGradient = { citizen: 'from-sky-500 to-cyan-400', authority: 'from-violet-500 to-purple-400', administrator: 'from-emerald-500 to-teal-400' };
  const roleBadge = { citizen: 'badge-blue', authority: 'badge-purple', administrator: 'badge-green' };
  const grad = roleGradient[user?.role] || 'from-gray-500 to-gray-400';

  const links = user?.role === 'citizen'
    ? [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }]
    : user?.role === 'authority'
    ? [{ to: '/', icon: LayoutDashboard, label: 'Reports' }, { to: '/?map=1', icon: Map, label: 'Heatmap' }]
    : [{ to: '/', icon: BarChart3, label: 'Analytics' }];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.4)]' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group select-none">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center glow-blue group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-[1.05rem] tracking-tight">Civic<span className="text-gradient-brand">AI</span></span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map(({ to, icon: Icon, label }) => (
            <Link key={label} to={to} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${location.pathname === to ? 'nav-link-active' : 'text-[--text-secondary] hover:text-white hover:bg-white/[0.06]'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </Link>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-10 h-10 rounded-xl glass-md flex items-center justify-center hover:bg-white/[0.08] transition-colors">
          {mobileMenu ? <X className="w-5 h-5 text-[--text-secondary]" /> : <Menu className="w-5 h-5 text-[--text-secondary]" />}
        </button>

        {/* Right */}
        <div className="hidden md:flex items-center gap-2">
          {user?.role === 'citizen' && (
            <Link to="/report/new" className="btn btn-primary py-1.5 px-3.5 text-xs rounded-xl glow-blue">
              <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">New Report</span>
            </Link>
          )}

          <button className="relative w-8 h-8 rounded-xl glass-md flex items-center justify-center hover:bg-white/[0.08] transition-colors">
            <Bell className="w-3.5 h-3.5 text-[--text-secondary]" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 gradient-danger rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button onClick={() => setDropdown(!dropdown)}
              className="flex items-center gap-1.5 glass-md px-2.5 py-1.5 rounded-xl hover:bg-white/[0.08] transition-colors">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-[11px] font-bold text-white`}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm text-white/80 font-medium max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
              <ChevronDown className={`w-3 h-3 text-[--text-secondary] transition-transform duration-200 ${dropdown ? 'rotate-180' : ''}`} />
            </button>

            {dropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-white/[0.08] overflow-hidden z-50 anim-scale-in">
                  <div className="px-4 py-3.5 border-b border-white/[0.07]">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-[--text-secondary] mt-0.5">{user?.email}</p>
                    <span className={`badge mt-2 text-[10px] uppercase tracking-wide ${roleBadge[user?.role] || 'badge-gray'}`}>
                      <Zap className="w-2.5 h-2.5" />{user?.role}
                    </span>
                  </div>
                  <button onClick={() => { signout(); navigate('/login'); setDropdown(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/[0.08] transition-colors">
                    <LogOut className="w-3.5 h-3.5" />Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileMenu && (
        <>
          <div className="mobile-nav-backdrop" onClick={() => setMobileMenu(false)} />
          <div className="mobile-nav-panel anim-scale-in">
            <div className="space-y-2">
              {links.map(({ to, icon: Icon, label }) => (
                <Link key={label} to={to} onClick={() => setMobileMenu(false)} className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${location.pathname === to ? 'nav-link-active' : 'text-[--text-secondary] hover:text-white hover:bg-white/[0.06]'}`}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
            </div>
            <div className="mt-3 border-t border-white/[0.08] pt-3 space-y-2">
              {user?.role === 'citizen' && (
                <Link to="/report/new" onClick={() => setMobileMenu(false)} className="btn btn-primary w-full py-2 text-sm rounded-xl">
                  <Plus className="w-4 h-4" /> New Report
                </Link>
              )}
              <button className="btn btn-secondary w-full py-2 text-sm rounded-xl flex items-center justify-center gap-2" onClick={() => setMobileMenu(false)}>
                <Bell className="w-4 h-4" /> Notifications
              </button>
              <button className="btn btn-danger w-full py-2 text-sm rounded-xl flex items-center justify-center gap-2" onClick={() => { signout(); navigate('/login'); setMobileMenu(false); }}>
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
