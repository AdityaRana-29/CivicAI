import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { getHeatmapData, getPredictions } from '../services/api';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import { Layers, TrendingUp, Eye, EyeOff } from 'lucide-react';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function HeatLayer({ data }) {
  const map = useMap();
  useEffect(() => {
    if (!data?.length) return;
    const layer = L.heatLayer(data, {
      radius: 28, blur: 38, maxZoom: 17,
      gradient: { 0.2: '#38bdf8', 0.5: '#818cf8', 0.8: '#fb923c', 1.0: '#f87171' },
    }).addTo(map);
    return () => map.removeLayer(layer);
  }, [data, map]);
  return null;
}

function PredictionLayer({ preds, show }) {
  const map = useMap();
  useEffect(() => {
    if (!show || !preds?.length) return;
    const layers = preds.map(p => {
      const [lon, lat] = p.centroid.coordinates;
      const color = p.riskRating === 'high' ? '#f87171' : '#fb923c';
      return L.circle([lat, lon], {
        radius: 500, color, fillColor: color,
        fillOpacity: 0.18, weight: 1.5,
      }).bindPopup(
        `<div style="font-family:Inter,sans-serif;padding:4px">
          <strong style="color:#0f172a">${p.dominantIssueType.replace(/_/g,' ')}</strong><br/>
          <span style="color:#64748b;font-size:12px">Risk: ${p.riskRating} · Count: ${p.recurrenceCount}</span>
        </div>`
      ).addTo(map);
    });
    return () => layers.forEach(l => map.removeLayer(l));
  }, [preds, show, map]);
  return null;
}

export default function HeatmapView({ filters = {} }) {
  const [showPredictions, setShowPredictions] = useState(false);
  const [center] = useState([20.5937, 78.9629]); // India center default

  const { data: heat } = useQuery({
    queryKey: ['heatmap', filters],
    queryFn: async () => { const r = await getHeatmapData(filters); return r.data.data; },
    refetchInterval: 60000,
  });

  const { data: preds } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => { const r = await getPredictions(); return r.data.data; },
  });

  return (
    <div className="relative h-full w-full">
      {/* Controls overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button onClick={() => setShowPredictions(!showPredictions)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all backdrop-blur-md
            ${showPredictions
              ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
              : 'bg-black/40 border-white/10 text-white/70 hover:text-white'}`}>
          {showPredictions ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
          Predictions
        </button>
        <div className="bg-black/50 border border-white/10 backdrop-blur-md rounded-xl p-2.5 text-xs text-white/60 space-y-1.5">
          <p className="font-semibold text-white/80 flex items-center gap-1"><Layers className="w-3 h-3"/>Legend</p>
          {[
            { color: '#38bdf8', label: 'Low density' },
            { color: '#818cf8', label: 'Medium' },
            { color: '#fb923c', label: 'High' },
            { color: '#f87171', label: 'Critical' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full flex-shrink-0" style={{ background: color }}/>
              {label}
            </div>
          ))}
          {showPredictions && (
            <>
              <div className="border-t border-white/10 pt-1.5 mt-1 font-semibold text-white/80 flex items-center gap-1">
                <TrendingUp className="w-3 h-3"/>Predictions
              </div>
              {[{ color:'#f87171', label:'High risk' },{ color:'#fb923c', label:'Medium risk' }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: color, background: color + '40' }}/>
                  {label}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }} className="rounded-2xl">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />
        <HeatLayer data={heat || []} />
        <PredictionLayer preds={preds} show={showPredictions} />
      </MapContainer>
    </div>
  );
}
