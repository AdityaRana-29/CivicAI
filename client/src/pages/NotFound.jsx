import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="mesh-bg" />
      <div className="orb orb-blue w-96 h-96 top-[-10%] left-[-5%] opacity-[0.07]" />
      <div className="orb orb-purple w-80 h-80 bottom-[-10%] right-[-5%] opacity-[0.06]" />

      <div className="relative z-10 text-center anim-scale-in">
        <div className="text-[120px] font-black text-gradient-brand leading-none mb-2">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-[--text-secondary] mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg glow-blue">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
