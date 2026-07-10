import { useState, useEffect } from 'react';
import { getPendingCount, getPendingReports, deletePendingReport, updateSyncAttempts } from '../services/offlineStorage';
import { submitReport } from '../services/api';
import toast from 'react-hot-toast';
import { WifiOff, Wifi, RefreshCw, CloudUpload } from 'lucide-react';

export default function OfflineBanner() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const refresh = async () => { const n = await getPendingCount(); setPending(n); };
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (online && pending > 0) syncAll(); }, [online]);

  const syncAll = async () => {
    if (syncing) return;
    setSyncing(true);
    const reports = await getPendingReports();
    let synced = 0;
    for (const r of reports) {
      if (r.syncAttempts >= 3) continue;
      try {
        const fd = new FormData();
        fd.append('photo', r.photoBlob, 'photo.jpg');
        fd.append('latitude', r.latitude);
        fd.append('longitude', r.longitude);
        if (r.description) fd.append('description', r.description);
        await submitReport(fd);
        await deletePendingReport(r.id);
        synced++;
      } catch {
        await updateSyncAttempts(r.id, r.syncAttempts + 1);
        if (r.syncAttempts + 1 >= 3) toast.error('A report failed to sync after 3 attempts.');
      }
    }
    if (synced > 0) toast.success(`${synced} offline report(s) synced!`);
    setPending(await getPendingCount());
    setSyncing(false);
  };

  if (pending === 0 && online) return null;

  return (
    <div className={`relative z-20 px-5 py-2.5 flex items-center justify-between text-sm border-b
      ${online
        ? 'bg-sky-500/[0.08] border-sky-500/20 text-sky-300'
        : 'bg-red-500/[0.08] border-red-500/20 text-red-300'}`}>
      <div className="flex items-center gap-2.5">
        {online
          ? <CloudUpload className="w-4 h-4 flex-shrink-0"/>
          : <WifiOff className="w-4 h-4 flex-shrink-0"/>}
        <span className="font-medium">
          {!online ? 'You are offline. ' : ''}
          {pending > 0 && `${pending} report${pending > 1 ? 's' : ''} pending upload.`}
        </span>
      </div>
      {online && pending > 0 && (
        <button onClick={syncAll} disabled={syncing}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 transition-colors border border-sky-500/30 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}/>
          {syncing ? 'Syncing…' : 'Sync Now'}
        </button>
      )}
    </div>
  );
}
