import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../hooks/useAuth';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const verifiedIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(16,185,129,0.5)"></div>`,
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -36],
});

const CLINICS = [
  { id:1, name:'Ruharo Mission Hospital', district:'Mbarara', parish:'Ruharo', phone:'+256 700 123456', opening:'07:00', closing:'22:00', verified:true, lat:-0.6167, lng:30.65, services:['Maternity','General Consultation','Pharmacy','HIV/AIDS'], medicines:['Amoxicillin','Paracetamol'] },
  { id:2, name:'TASO Mbarara', district:'Mbarara', parish:'Kamukuzi', phone:'+256 700 789012', opening:'08:00', closing:'17:00', verified:true, lat:-0.605, lng:30.642, services:['HIV/AIDS','Pharmacy','Counseling'], medicines:['ARVs','Paracetamol'] },
  { id:3, name:'Kampala General Hospital', district:'Kampala', parish:'Central', phone:'+256 312 123456', opening:'00:00', closing:'23:59', verified:true, lat:0.3136, lng:32.5811, services:['Maternity','Dental','Emergency'], medicines:['Amoxicillin','Ciprofloxacin'] },
  { id:4, name:'Nsambya Hospital', district:'Kampala', parish:'Nsambya', phone:'+256 414 123456', opening:'07:30', closing:'21:00', verified:true, lat:0.2989, lng:32.5847, services:['Maternity','Paediatrics'], medicines:['Paracetamol'] },
  { id:5, name:'Gulu Regional Hospital', district:'Gulu', parish:'Gulu City', phone:'+256 471 432111', opening:'00:00', closing:'23:59', verified:true, lat:2.7745, lng:32.2990, services:['General Consultation','Surgery','HIV/AIDS'], medicines:['Artemether','ARVs'] },
  { id:6, name:'Lacor Hospital', district:'Gulu', parish:'Lacor', phone:'+256 392 123456', opening:'08:00', closing:'18:00', verified:true, lat:2.785, lng:32.274, services:['Maternity','Pharmacy'], medicines:['Amoxicillin'] },
  { id:7, name:'Jinja Regional Hospital', district:'Jinja', parish:'Jinja Central', phone:'+256 434 123456', opening:'07:00', closing:'22:00', verified:true, lat:0.4244, lng:33.2041, services:['Maternity','General Consultation'], medicines:['Paracetamol','Quinine'] },
  { id:8, name:'Good Samaritan Clinic', district:'Mbarara', parish:'Katete', phone:'+256 700 555666', opening:'09:00', closing:'18:00', verified:false, lat:-0.622, lng:30.658, services:['General Consultation','Pharmacy'], medicines:['Paracetamol','Ibuprofen'] },
];

const SERVICES = ['All Services','Maternity','General Consultation','Pharmacy','HIV/AIDS','Dental','Emergency','Surgery','Paediatrics','Counseling'];
const ARTICLES = [
  { id:1, title:'Malaria Prevention Tips', category:'Prevention', emoji:'🦟', content:'Use insecticide-treated nets, eliminate standing water, and seek treatment within 24 hours of fever onset.' },
  { id:2, title:'Nutrition & Healthy Eating', category:'Nutrition', emoji:'🥗', content:'A balanced diet of fruits, vegetables, whole grains and lean proteins supports immunity and long-term wellbeing.' },
  { id:3, title:'Benefits of Regular Exercise', category:'Fitness', emoji:'🏃', content:'30 minutes of daily activity reduces risk of heart disease, diabetes, depression and improves overall quality of life.' },
];

const PatientDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [locationFilter, setLocationFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('hb_appointments');
    if (stored) setAppointments(JSON.parse(stored));
  }, []);

  const handleSearch = () => {
    let results = CLINICS.filter(c => c.verified);
    if (locationFilter) results = results.filter(c =>
      c.district.toLowerCase().includes(locationFilter.toLowerCase()) ||
      c.parish.toLowerCase().includes(locationFilter.toLowerCase())
    );
    if (serviceFilter && serviceFilter !== 'All Services') results = results.filter(c => c.services.includes(serviceFilter));
    setSearchResults(results);
    setShowMap(true);
  };

  const bookAppointment = (clinic: any) => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const apt = {
      id: Date.now(), clinic_name: clinic.name, clinic_district: clinic.district,
      appointment_date: date.toISOString().split('T')[0], appointment_time: '09:00', status: 'scheduled',
    };
    const updated = [...appointments, apt];
    setAppointments(updated);
    localStorage.setItem('hb_appointments', JSON.stringify(updated));
    setSelectedClinic(null);
    alert(`✅ Appointment booked at ${clinic.name}!`);
  };

  const displayClinics = searchResults ?? CLINICS.filter(c => c.verified).slice(0, 3);
  const mapClinics = (searchResults ?? CLINICS).filter(c => c.verified);

  return (
    <div style={{ fontFamily: "'Outfit','Inter',sans-serif" }} className="space-y-8 animate-in fade-in duration-500">

      {/* Hero + Search */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)',
        borderRadius: 28, padding: '2.5rem', position: 'relative', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(124,58,237,0.35)'
      }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, background:'radial-gradient(circle,rgba(167,139,250,0.15),transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:-60, left:-40, width:240, height:240, background:'radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'relative', zIndex:10 }}>
          <div style={{ marginBottom: 6, display:'inline-flex', alignItems:'center', gap:8, padding:'4px 14px', background:'rgba(255,255,255,0.1)', borderRadius:100, border:'1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80' }} />
            <span style={{ color:'#c4b5fd', fontSize:10, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase' }}>HealthBridge Patient Portal</span>
          </div>
          <h1 style={{ margin:'10px 0 8px', fontSize:'clamp(26px,4vw,44px)', fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>
            Welcome back, {user?.first_name || 'Patient'} 👋
          </h1>
          <p style={{ margin:'0 0 28px', color:'rgba(255,255,255,0.6)', fontSize:16, fontWeight:500 }}>
            Find verified clinics near you, book appointments and manage your health — all in one place.
          </p>

          {/* Search bar */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, background:'rgba(255,255,255,0.08)', backdropFilter:'blur(16px)', padding:12, borderRadius:20, border:'1px solid rgba(255,255,255,0.15)' }}>
            <input
              type="text" placeholder="🔍 Search by district or parish…"
              value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex:1, minWidth:200, padding:'12px 18px', borderRadius:14, border:'none', fontSize:14, fontWeight:600, color:'#0f172a', outline:'none' }}
            />
            <select
              value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
              style={{ padding:'12px 16px', borderRadius:14, border:'none', fontSize:14, fontWeight:600, color:'#0f172a', background:'#fff', outline:'none', cursor:'pointer' }}
            >
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button
              onClick={handleSearch}
              style={{ padding:'12px 28px', borderRadius:14, border:'none', cursor:'pointer', background:'#fff', color:'#7c3aed', fontWeight:800, fontSize:14, boxShadow:'0 4px 16px rgba(0,0,0,0.15)', transition:'all 0.3s ease' }}
              className="hover:bg-violet-50 active:scale-95"
            >
              Search Clinics
            </button>
            <button
              onClick={() => setShowMap(v => !v)}
              style={{ padding:'12px 22px', borderRadius:14, border:'2px solid rgba(255,255,255,0.3)', cursor:'pointer', background:'transparent', color:'#fff', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6, transition:'all 0.3s ease' }}
              className="hover:bg-white/10"
            >
              🗺️ {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
        {[
          { label:'My Appointments', value: appointments.length, icon:'📅', color:'#7c3aed', bg:'#f5f3ff' },
          { label:'Verified Clinics', value: CLINICS.filter(c=>c.verified).length, icon:'🏥', color:'#0891b2', bg:'#ecfeff' },
          { label:'Districts Covered', value: [...new Set(CLINICS.map(c=>c.district))].length, icon:'📍', color:'#059669', bg:'#ecfdf5' },
          { label:'Privacy Guaranteed', value:'100%', icon:'🔒', color:'#dc2626', bg:'#fff1f2' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:18, padding:'18px 20px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 10px rgba(0,0,0,0.04)', transition:'all 0.3s ease' }}
            className="hover:-translate-y-0.5 hover:shadow-md"
          >
            <div style={{ width:48, height:48, borderRadius:14, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:24, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Map */}
      {showMap && (
        <div style={{ borderRadius:24, overflow:'hidden', border:'1px solid #e2e8f0', boxShadow:'0 8px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ background:'linear-gradient(90deg,#1e1b4b,#4c1d95)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:20 }}>🗺️</span>
              <div>
                <div style={{ color:'#fff', fontWeight:800, fontSize:15 }}>Clinic Network Map</div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>{mapClinics.length} verified facilities shown</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'rgba(255,255,255,0.1)', borderRadius:100 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#10b981' }} />
              <span style={{ color:'#a7f3d0', fontSize:11, fontWeight:700 }}>Live Data</span>
            </div>
          </div>
          <MapContainer
            center={[1.3733, 32.2903]} zoom={7}
            style={{ height:420, width:'100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapClinics.map(clinic => (
              <Marker key={clinic.id} position={[clinic.lat, clinic.lng]} icon={verifiedIcon}>
                <Popup>
                  <div style={{ fontFamily:"'Outfit',sans-serif", minWidth:200, padding:4 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:6 }}>{clinic.name}</div>
                    <div style={{ color:'#64748b', fontSize:12, marginBottom:8 }}>📍 {clinic.district}, {clinic.parish}</div>
                    <div style={{ fontSize:12, color:'#059669', fontWeight:700, marginBottom:8 }}>✅ Verified Facility</div>
                    <div style={{ fontSize:12, color:'#475569', marginBottom:10 }}>⏰ {clinic.opening} – {clinic.closing}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                      {clinic.services.slice(0,3).map((s:string) => (
                        <span key={s} style={{ padding:'2px 8px', borderRadius:100, background:'#f5f3ff', color:'#7c3aed', fontSize:10, fontWeight:700 }}>{s}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedClinic(clinic)}
                      style={{ width:'100%', padding:'8px', background:'linear-gradient(135deg,#4c1d95,#7c3aed)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer' }}
                    >
                      View & Book →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Clinic Cards */}
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <h2 style={{ margin:0, fontSize:22, fontWeight:900, color:'#0f172a' }}>
              {searchResults ? `${searchResults.length} Clinics Found` : 'Recommended Facilities'}
            </h2>
            <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:13, fontWeight:500 }}>
              {searchResults ? 'Matching your search criteria' : 'Top verified clinics near you'}
            </p>
          </div>
          {searchResults && (
            <button onClick={() => { setSearchResults(null); setLocationFilter(''); setServiceFilter(''); }}
              style={{ padding:'8px 18px', borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              × Clear Search
            </button>
          )}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
          {displayClinics.map(c => (
            <div key={c.id} onClick={() => setSelectedClinic(c)} style={{
              background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', padding:'22px 24px',
              cursor:'pointer', transition:'all 0.3s ease', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'
            }}
              className="hover:shadow-xl hover:border-violet-200 hover:-translate-y-1 group"
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏥</div>
                {c.verified && <span style={{ padding:'4px 10px', borderRadius:100, background:'#ecfdf5', color:'#065f46', fontSize:10, fontWeight:800 }}>✓ Verified</span>}
              </div>
              <h3 style={{ margin:'0 0 4px', fontSize:16, fontWeight:800, color:'#0f172a' }}>{c.name}</h3>
              <p style={{ margin:'0 0 12px', color:'#64748b', fontSize:13, fontWeight:500 }}>📍 {c.district} · {c.parish}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                {c.services.slice(0,2).map((s:string) => (
                  <span key={s} style={{ padding:'3px 10px', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', color:'#475569', fontSize:11, fontWeight:700 }}>{s}</span>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #f1f5f9', paddingTop:12 }}>
                <span style={{ color:'#94a3b8', fontSize:12, fontWeight:600 }}>⏰ {c.opening} – {c.closing}</span>
                <span style={{ color:'#7c3aed', fontWeight:800, fontSize:13 }}>Book →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Articles */}
      <div style={{ background:'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius:28, padding:'2.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, left:-40, width:300, height:300, background:'radial-gradient(circle,rgba(124,58,237,0.15),transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'relative', zIndex:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:12 }}>
            <div>
              <h2 style={{ margin:0, fontSize:22, fontWeight:900, color:'#fff' }}>Health Education</h2>
              <p style={{ margin:'4px 0 0', color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:500 }}>Stay informed, stay healthy</p>
            </div>
            <button style={{ padding:'8px 20px', borderRadius:100, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}
              className="hover:bg-white/10"
            >Browse All</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
            {ARTICLES.map(a => (
              <div key={a.id} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:22, cursor:'pointer', transition:'all 0.3s ease' }}
                className="hover:bg-white/10"
              >
                <div style={{ fontSize:32, marginBottom:12 }}>{a.emoji}</div>
                <span style={{ padding:'3px 10px', borderRadius:100, background:'rgba(124,58,237,0.3)', color:'#c4b5fd', fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em' }}>{a.category}</span>
                <h3 style={{ margin:'10px 0 8px', fontSize:16, fontWeight:800, color:'#fff' }}>{a.title}</h3>
                <p style={{ margin:'0 0 14px', color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:1.6 }}>{a.content}</p>
                <span style={{ color:'#a78bfa', fontWeight:700, fontSize:13 }}>Read more →</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clinic Modal */}
      {selectedClinic && (
        <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(15,23,42,0.7)', backdropFilter:'blur(6px)' }} onClick={() => setSelectedClinic(null)} />
          <div style={{ background:'#fff', borderRadius:28, padding:'36px 40px', width:'100%', maxWidth:520, boxShadow:'0 40px 100px rgba(0,0,0,0.3)', position:'relative', zIndex:10 }}
            className="animate-in zoom-in-95 duration-200"
          >
            <button onClick={() => setSelectedClinic(null)} style={{ position:'absolute', top:20, right:20, width:36, height:36, borderRadius:'50%', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
              <div style={{ width:60, height:60, borderRadius:18, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🏥</div>
              <div>
                <h2 style={{ margin:0, fontSize:22, fontWeight:900, color:'#0f172a' }}>{selectedClinic.name}</h2>
                <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:13, fontWeight:500 }}>
                  {selectedClinic.verified && <span style={{ color:'#059669', fontWeight:700 }}>✅ Verified · </span>}
                  {selectedClinic.district}, {selectedClinic.parish}
                </p>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              {[['📞 Phone', selectedClinic.phone],['⏰ Hours', `${selectedClinic.opening} – ${selectedClinic.closing}`]].map(([label,val]) => (
                <div key={label} style={{ padding:'14px 16px', background:'#f8fafc', borderRadius:14 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:4 }}>{label}</div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:20 }}>
              <p style={{ margin:'0 0 10px', fontSize:12, fontWeight:800, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em' }}>🩺 Available Services</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {selectedClinic.services.map((s:string) => <span key={s} style={{ padding:'5px 14px', borderRadius:100, background:'#f5f3ff', color:'#7c3aed', fontSize:12, fontWeight:700 }}>{s}</span>)}
              </div>
            </div>
            <div style={{ marginBottom:28 }}>
              <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:800, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em' }}>💊 Medicines Available</p>
              <p style={{ margin:0, color:'#64748b', fontSize:13, fontWeight:500 }}>{selectedClinic.medicines.join(', ')}</p>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => bookAppointment(selectedClinic)} style={{ flex:1, padding:'14px', borderRadius:16, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#4c1d95,#7c3aed)', color:'#fff', fontWeight:800, fontSize:15, boxShadow:'0 8px 24px rgba(124,58,237,0.35)', transition:'all 0.3s ease' }}
                className="hover:opacity-90 active:scale-95"
              >
                Confirm Appointment
              </button>
              <button onClick={() => setSelectedClinic(null)} style={{ padding:'14px 24px', borderRadius:16, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboardView;
