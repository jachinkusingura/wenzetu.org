import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/shared/Icon';

const CLINICS = [
  { id: 1, name: 'Ruharo Mission Hospital', district: 'Mbarara', parish: 'Ruharo', phone: '+256 700 123456', opening: '07:00', closing: '22:00', verified: true, services: ['Maternity', 'General Consultation', 'Pharmacy', 'HIV/AIDS'], medicines: ['Amoxicillin', 'Paracetamol'] },
  { id: 2, name: 'TASO Mbarara', district: 'Mbarara', parish: 'Kamukuzi', phone: '+256 700 789012', opening: '08:00', closing: '17:00', verified: true, services: ['HIV/AIDS', 'Pharmacy', 'Counseling'], medicines: ['ARVs', 'Paracetamol'] },
  { id: 3, name: 'Kampala General Hospital', district: 'Kampala', parish: 'Central', phone: '+256 312 123456', opening: '00:00', closing: '23:59', verified: true, services: ['Maternity', 'Dental', 'Emergency'], medicines: ['Amoxicillin', 'Ciprofloxacin'] },
  { id: 4, name: 'Nsambya Hospital', district: 'Kampala', parish: 'Nsambya', phone: '+256 414 123456', opening: '07:30', closing: '21:00', verified: true, services: ['Maternity', 'Paediatrics'], medicines: ['Paracetamol'] },
  { id: 5, name: 'Gulu Regional Hospital', district: 'Gulu', parish: 'Gulu City', phone: '+256 471 432111', opening: '00:00', closing: '23:59', verified: true, services: ['General Consultation', 'Surgery', 'HIV/AIDS'], medicines: ['Artemether', 'ARVs'] },
  { id: 6, name: 'Lacor Hospital', district: 'Gulu', parish: 'Lacor', phone: '+256 392 123456', opening: '08:00', closing: '18:00', verified: true, services: ['Maternity', 'Pharmacy'], medicines: ['Amoxicillin'] },
  { id: 7, name: 'Jinja Regional Hospital', district: 'Jinja', parish: 'Jinja Central', phone: '+256 434 123456', opening: '07:00', closing: '22:00', verified: true, services: ['Maternity', 'General Consultation'], medicines: ['Paracetamol', 'Quinine'] },
  { id: 8, name: 'Good Samaritan Clinic', district: 'Mbarara', parish: 'Katete', phone: '+256 700 555666', opening: '09:00', closing: '18:00', verified: false, services: ['General Consultation', 'Pharmacy'], medicines: ['Paracetamol', 'Ibuprofen'] },
];

const ARTICLES = [
  { id: 1, title: 'Malaria Prevention', category: 'Prevention', content: 'Sleep under insecticide-treated mosquito nets, clear standing water around your home, and seek early treatment.' },
  { id: 2, title: 'Healthy Eating Tips', category: 'Nutrition', content: 'A balanced diet rich in fruits, vegetables, whole grains, and lean proteins supports overall health and disease prevention.' },
  { id: 3, title: 'Importance of Exercise', category: 'Fitness', content: 'Regular physical activity — even 30 minutes of walking daily — reduces risks of heart disease, diabetes, and mental health issues.' },
];

const SERVICES = ['All Services', 'Maternity', 'General Consultation', 'Pharmacy', 'HIV/AIDS', 'Mental Health', 'Dental', 'Emergency', 'Surgery', 'Paediatrics'];

const PatientDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [locationFilter, setLocationFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('hb_appointments');
    if (stored) setAppointments(JSON.parse(stored));
  }, []);

  const handleSearch = () => {
    let results = CLINICS.filter(c => c.verified);
    if (locationFilter) results = results.filter(c => c.district.toLowerCase().includes(locationFilter.toLowerCase()) || c.parish.toLowerCase().includes(locationFilter.toLowerCase()));
    if (serviceFilter && serviceFilter !== 'All Services') results = results.filter(c => c.services.includes(serviceFilter));
    setSearchResults(results);
  };

  const bookAppointment = (clinic: any) => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const newApt = {
      id: Date.now(),
      clinic_name: clinic.name,
      clinic_district: clinic.district,
      appointment_date: date.toISOString().split('T')[0],
      appointment_time: '09:00',
      status: 'scheduled',
    };
    const updated = [...appointments, newApt];
    setAppointments(updated);
    localStorage.setItem('hb_appointments', JSON.stringify(updated));
    setSelectedClinic(null);
    alert(`✅ Appointment booked at ${clinic.name}!`);
  };

  const featured = CLINICS.filter(c => c.verified).slice(0, 3);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Hero Welcome */}
      <div className="rounded-[2rem] p-10 text-white relative overflow-hidden gradient-premium shadow-2xl shadow-purple-200">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Welcome back, {user?.first_name || 'Patient'} 👋
          </h1>
          <p className="text-xl text-purple-100 mb-8 font-medium">
            Find and book the best healthcare services in your neighborhood.
          </p>
          
          <div className="flex flex-wrap gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <input 
              type="text" 
              placeholder="District or Parish..." 
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="px-6 py-3 rounded-xl text-neutral-900 font-medium flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-white/50" 
            />
            <select 
              value={serviceFilter} 
              onChange={e => setServiceFilter(e.target.value)}
              className="px-6 py-3 rounded-xl text-neutral-900 font-medium focus:outline-none bg-white"
            >
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button 
              onClick={handleSearch}
              className="px-8 py-3 rounded-xl font-bold bg-white text-primary-600 hover:bg-purple-50 transition-all shadow-lg active:scale-95"
            >
              Search
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-5%] w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
            <Icon name="calendar" size={32} />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900">{appointments.length}</p>
            <p className="text-neutral-500 font-medium">Active Appointments</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
          <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
            <Icon name="hospital" size={32} />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900">{CLINICS.filter(c => c.verified).length}</p>
            <p className="text-neutral-500 font-medium">Verified Clinics</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
          <div className="w-16 h-16 rounded-2xl bg-accent-green/10 flex items-center justify-center text-accent-green group-hover:scale-110 transition-transform">
            <Icon name="check" size={32} />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900">100%</p>
            <p className="text-neutral-500 font-medium">Privacy Guaranteed</p>
          </div>
        </div>
      </div>

      {/* Featured Clinics */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Recommended Clinics</h2>
          <button className="text-primary-600 font-bold hover:underline">View All</button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(searchResults ?? featured).map(c => (
            <div key={c.id} onClick={() => setSelectedClinic(c)} className="bg-white rounded-[2rem] border border-neutral-100 p-6 cursor-pointer hover:shadow-xl hover:border-primary-200 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  <Icon name="hospital" size={24} />
                </div>
                {c.verified && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">✓ Verified</span>}
              </div>
              <p className="font-bold text-xl text-neutral-900 mb-1">{c.name}</p>
              <p className="text-neutral-500 text-sm mb-4 flex items-center gap-1">
                <Icon name="map-pin" size={14} /> {c.district} · {c.parish}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {c.services.slice(0, 2).map(s => (
                  <span key={s} className="text-xs font-bold px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600">{s}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                <p className="text-sm font-semibold text-neutral-400 flex items-center gap-1">
                  <Icon name="clock" size={14} /> {c.opening} – {c.closing}
                </p>
                <span className="text-primary-600 font-bold group-hover:translate-x-1 transition-transform">Details →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Articles */}
      <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Health Education</h2>
            <button className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors font-semibold">Browse All</button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {ARTICLES.map(a => (
              <div key={a.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-500 text-white mb-4 inline-block">{a.category}</span>
                <h3 className="font-bold text-xl mb-3 leading-tight">{a.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-4">{a.content}</p>
                <span className="text-sm font-bold text-primary-400 hover:text-primary-300">Read article</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decor */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Clinic Detail Modal */}
      {selectedClinic && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setSelectedClinic(null)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedClinic(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 transition-colors">
              <Icon name="x-mark" size={24} />
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                <Icon name="hospital" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">{selectedClinic.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                   {selectedClinic.verified && <span className="text-green-600 text-sm font-bold flex items-center gap-1">✓ Verified Clinic</span>}
                   <span className="text-neutral-300">·</span>
                   <span className="text-neutral-500 text-sm">{selectedClinic.district}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-2xl">
                   <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Phone</p>
                   <p className="font-bold text-neutral-900">{selectedClinic.phone}</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-2xl">
                   <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Hours</p>
                   <p className="font-bold text-neutral-900">{selectedClinic.opening} – {selectedClinic.closing}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <Icon name="stethoscope" size={18} className="text-primary-600" /> Available Services
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedClinic.services.map((s: string) => (
                    <span key={s} className="px-4 py-2 rounded-xl bg-primary-50 text-primary-700 font-bold text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-900 mb-2">Available Medicines</p>
                <p className="text-neutral-600 font-medium">{selectedClinic.medicines.join(', ')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => bookAppointment(selectedClinic)}
                className="flex-1 py-4 rounded-2xl font-bold text-white gradient-purple shadow-xl shadow-purple-200 active:scale-95 transition-all"
              >
                Confirm Appointment
              </button>
              <button 
                onClick={() => setSelectedClinic(null)}
                className="px-8 py-4 rounded-2xl font-bold text-neutral-500 hover:bg-neutral-50 border border-neutral-100 transition-colors"
              >
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
