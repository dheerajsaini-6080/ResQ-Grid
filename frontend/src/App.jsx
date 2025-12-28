import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import toast, { Toaster } from 'react-hot-toast';
import { Activity, Radio, Map as MapIcon, PlusCircle, Navigation, Search, Camera, CheckCircle, AlertTriangle } from 'lucide-react'; // Pro Icons
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- 🎨 PRO ASSETS ---
const createEmojiIcon = (emoji) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); transition: transform 0.2s;">${emoji}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const icons = {
  "🔥 Fire": createEmojiIcon("🔥"),
  "🚑 Medical": createEmojiIcon("🚑"),
  "🚗 Accident": createEmojiIcon("🚗"),
  "🚓 Crime": createEmojiIcon("🚓"),
  "default": createEmojiIcon("📍"),
};

export default function App() {
  const [view, setView] = useState('dashboard'); 
  const [incidents, setIncidents] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  // --- 📡 HEARTBEAT ---
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5005/api/incidents');
        const data = await res.json();
        setIncidents(data);
        setIsOnline(true);
      } catch (err) { setIsOnline(false); }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />

      {/* 🧭 DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex bg-slate-900 text-white flex-col w-72 z-50 shadow-2xl relative">
        <div className="p-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 tracking-tighter">
            RESQ<span className="text-white">GRID</span>
          </h1>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-slate-800 py-1.5 px-3 rounded-full w-fit">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isOnline ? "System Online" : "Reconnecting..."}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<Activity size={20}/>} label="Live Command" />
          <NavButton active={view === 'report'} onClick={() => setView('report')} icon={<PlusCircle size={20}/>} label="New Incident" />
        </nav>
        
        <div className="p-8 text-xs text-slate-500 font-mono">
          ID: RESQ-CMD-01<br/>LAT: 20.5937
        </div>
      </aside>

      {/* 📱 MOBILE TOP HEADER */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-50">
          <h1 className="text-xl font-black tracking-tighter">RESQ<span className="text-red-500">GRID</span></h1>
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
      </div>

      {/* 🖥️ MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {view === 'dashboard' ? <DashboardView incidents={incidents} /> : <ReportView />}
      </div>

      {/* 📱 MOBILE BOTTOM NAV (The "Thumb Zone") */}
      <div className="md:hidden bg-white border-t border-slate-200 flex justify-around p-3 pb-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <MobileNavBtn active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<MapIcon />} label="Map" />
        <div className="w-px bg-slate-200 h-full mx-2"></div>
        <MobileNavBtn active={view === 'report'} onClick={() => setView('report')} icon={<AlertTriangle />} label="Report" highlight />
      </div>
    </div>
  );
}

// --- 🎨 PRO COMPONENTS ---

function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all duration-200 ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/20 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
}

function MobileNavBtn({ active, onClick, icon, label, highlight }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 w-full transition-all active:scale-95 ${active ? 'text-red-600' : 'text-slate-400'}`}>
      <div className={`p-2 rounded-full ${highlight && active ? 'bg-red-100' : ''}`}>{icon}</div>
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );
}

// --- 📡 DASHBOARD VIEW (Split Layout) ---
function DashboardView({ incidents }) {
  return (
    <div className="flex flex-col h-full relative">
      {/* MAP LAYER */}
      <div className="h-[60%] md:h-full w-full relative z-0">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} zoomControl={false} style={{ height: "100%", width: "100%" }}>
          {/* Pro Map Tiles: CartoDB Voyager (Clean & Modern) */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png" />
          {incidents.map((inc) => (
            inc.latitude && (
              <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={icons[inc.type] || icons["default"]}>
                <Popup className="pro-popup">
                  <div className="p-2 min-w-[150px]">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${inc.severity==='High'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{inc.severity} Priority</span>
                    <strong className="text-lg block mt-1">{inc.type.split(" ")[0]}</strong>
                    <span className="text-xs text-slate-500">{inc.location}</span>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
        
        {/* Floating Stat Card (Glassmorphism) */}
        <div className="absolute top-4 right-4 z-[400] bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/50">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600"><Activity size={18}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Alerts</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{incidents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEED LAYER (Bottom Sheet on Mobile, Floating Panel on Desktop) */}
      <div className="absolute bottom-0 md:top-4 md:left-4 md:bottom-auto w-full md:w-96 h-[40%] md:h-[calc(100%-2rem)] bg-white md:rounded-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] md:shadow-2xl z-[400] flex flex-col overflow-hidden border-t md:border border-slate-200">
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Recent Incidents <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{incidents.length}</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl">{inc.type.includes("Fire") ? "🔥" : inc.type.includes("Medical") ? "🚑" : "🚗"}</div>
                    <div className="w-px h-full bg-slate-100"></div>
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <h3 className="font-bold text-slate-800">{inc.type.split(" ")[1]} Alert</h3>
                     <span className="text-[10px] font-mono text-slate-400">{inc.timestamp.split(" ")[1]}</span>
                   </div>
                   <p className="text-xs text-slate-500 font-medium mb-2">{inc.location}</p>
                   
                   {inc.image_url && <img src={`http://127.0.0.1:5005/uploads/${inc.image_url}`} className="w-full h-32 object-cover rounded-lg mb-3" />}

                   {inc.status === 'Verified' ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                        <CheckCircle size={12}/> VERIFIED
                      </div>
                  ) : (
                      <button onClick={() => { fetch(`http://127.0.0.1:5005/api/verify/${inc.id}`, {method:'POST'}); toast.success("Verified"); }} className="text-xs w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-lg transition">
                        Verify Report
                      </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 📝 REPORT VIEW (The Wizard) ---
function ReportView() {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [mapInstance, setMapInstance] = useState(null);
  const [formState, setFormState] = useState({ type: "🔥 Fire", severity: "High" });

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const isHigh = newType.includes("Fire") || newType.includes("Medical") || newType.includes("Crime");
    setFormState({ type: newType, severity: isHigh ? "High" : "Medium" });
  };

  useEffect(() => {
    if (position) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
        .then(res => res.json())
        .then(data => { if (data.display_name) setAddress(data.display_name.split(',').slice(0, 3).join(',')); });
    }
  }, [position]);

  const handleSearch = async () => {
    if (!address) return;
    const toastId = toast.loading("Triangulating...");
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
    const data = await res.json();
    if (data[0]) {
      const latlng = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      setPosition(latlng);
      mapInstance.flyTo(latlng, 16);
      toast.success("Target Locked", { id: toastId });
    }
  };

  const handleGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(latlng);
        mapInstance.flyTo(latlng, 16);
        toast.success("GPS Acquired");
      },
      () => toast.error("GPS Failed")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) return toast.error("Location Pin Required!");
    
    const formData = new FormData(e.target);
    formData.append('latitude', position.lat);
    formData.append('longitude', position.lng);
    formData.append('severity', formState.severity);
    formData.set('location', address);

    await fetch('http://127.0.0.1:5005/api/report', { method: 'POST', body: formData });
    toast.success("INCIDENT BROADCASTED 🚀");
    window.location.reload();
  };

  function LocationMarker() {
    useMapEvents({ click(e) { setPosition(e.latlng); } });
    return position ? <Marker position={position} icon={icons["default"]} /> : null;
  }

  return (
    <div className="flex flex-col-reverse md:flex-row h-full">
      {/* FORM SIDE */}
      <div className="w-full md:w-[480px] bg-white z-10 shadow-2xl overflow-y-auto">
        <div className="p-8">
          <h2 className="text-2xl font-black text-slate-800 mb-1 flex items-center gap-2">
            <AlertTriangle className="text-red-600" /> New Incident
          </h2>
          <p className="text-slate-400 text-sm mb-8">Fill details to broadcast alert to responders.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type & Severity Group */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Emergency Type</label>
                 <div className="relative">
                   <select name="type" value={formState.type} onChange={handleTypeChange} className="w-full p-4 pl-10 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-red-500 outline-none">
                     <option value="🔥 Fire">🔥 Fire Outbreak</option>
                     <option value="🚑 Medical">🚑 Medical Emergency</option>
                     <option value="🚗 Accident">🚗 Road Accident</option>
                     <option value="🚓 Crime">🚓 Security Threat</option>
                   </select>
                   <div className="absolute left-3 top-4 text-slate-400"><Activity size={18}/></div>
                 </div>
              </div>
            </div>

            {/* Severity Card */}
            <div className={`p-4 rounded-xl border-l-4 ${formState.severity === 'High' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'}`}>
               <p className="text-xs font-bold uppercase mb-1 opacity-70">Automated Severity Level</p>
               <h3 className={`text-xl font-black ${formState.severity === 'High' ? 'text-red-700' : 'text-yellow-700'}`}>{formState.severity} PRIORITY</h3>
            </div>

            {/* Location */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Location Data</label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                   <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Search area..." className="w-full p-3 pl-10 border border-slate-200 rounded-xl bg-slate-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                   <div className="absolute left-3 top-3.5 text-slate-400"><Search size={16}/></div>
                </div>
                <button type="button" onClick={handleSearch} className="bg-slate-800 text-white px-4 rounded-xl hover:bg-slate-700"><Navigation size={18}/></button>
              </div>
              <button type="button" onClick={handleGPS} className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-blue-200 border-dashed">
                <Navigation size={14} className="animate-pulse"/> USE LIVE GPS COORDINATES
              </button>
            </div>

            {/* Camera */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Evidence</label>
              <label className="w-full p-4 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 transition group">
                <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition"><Camera size={20} className="text-slate-600"/></div>
                <span className="text-sm font-bold text-slate-500">Upload Photo or Video</span>
                <input type="file" name="image" accept="image/*" className="hidden" />
              </label>
            </div>

            <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-xl shadow-xl shadow-red-500/20 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all text-lg tracking-wide flex items-center justify-center gap-2">
              <Radio size={20} className="animate-pulse"/> BROADCAST ALERT
            </button>
          </form>
        </div>
      </div>

      {/* MAP SIDE */}
      <div className="w-full md:flex-1 h-64 md:h-auto bg-slate-200 relative">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }} ref={setMapInstance} zoomControl={false}>
           <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
           <LocationMarker />
        </MapContainer>
        {position && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg z-[400] text-xs font-mono border border-slate-200">
                <div className="text-emerald-500 font-bold flex items-center gap-1">GPS LOCKED <CheckCircle size={10}/></div>
                <div className="text-slate-800">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</div>
            </div>
        )}
      </div>
    </div>
  );
}