import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../components/shared/Icon';

interface Clinic {
  id: number;
  name: string;
  district: string;
  parish: string;
  is_verified: boolean;
}

interface Stats {
  totalClinics: number;
  verifiedClinics: number;
}

const HealthBridgeAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalClinics: 0, verifiedClinics: 0 });
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verification' | 'reports' | 'articles'>('verification');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, clinicsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/admin/clinics')
      ]);
      setStats(statsRes.data);
      setClinics(clinicsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyClinic = async (id: number) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/clinics/${id}/verify`);
      fetchData(); // Refresh data
    } catch (error) {
      alert('Failed to verify clinic');
    }
  };

  const pendingClinics = clinics.filter(c => !c.is_verified);
  const verificationProgress = stats.totalClinics > 0 
    ? (stats.verifiedClinics / stats.totalClinics) * 100 
    : 0;

  if (loading) return (
    <div className="p-20 text-center">
       <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
       <p className="text-neutral-400 font-bold tracking-widest uppercase text-xs">Initializing Secure Console...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Header Section */}
      <div className="relative p-10 bg-gradient-to-r from-[#0f1715] to-[#1a2e2a] rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-[2rem] flex items-center justify-center text-white shadow-[0_10px_40px_rgba(234,179,8,0.4)] transform hover:rotate-6 transition-transform duration-500">
              <Icon name="star" size={40} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-outfit">
                System <span className="text-primary-400">Authority</span>
              </h1>
              <p className="text-primary-100/60 font-semibold tracking-wide mt-2">HealthBridge Central Administrator Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white">
                <span className="block text-[10px] uppercase font-black text-primary-400 tracking-[0.2em] mb-1">Status</span>
                <span className="font-bold flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                   Operational
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-neutral-100 group">
          <div className="flex justify-between items-start mb-10">
             <div>
                <h3 className="text-2xl font-black text-neutral-900 mb-1">Facility Network</h3>
                <p className="text-neutral-400 font-medium">Real-time verification coverage across Uganda</p>
             </div>
             <div className="text-right">
                <span className="text-5xl font-black text-primary-600 font-outfit tracking-tighter">{Math.round(verificationProgress)}%</span>
                <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Coverage Rate</span>
             </div>
          </div>

          <div className="w-full h-5 bg-neutral-50 rounded-full mb-12 p-1 overflow-hidden">
             <div 
                className="h-full bg-gradient-to-r from-primary-400 via-primary-600 to-primary-700 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out" 
                style={{ width: `${verificationProgress}%` }}
             ></div>
          </div>

          <div className="grid grid-cols-3 gap-8">
             <div className="space-y-1">
                <span className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">Active Units</span>
                <p className="text-3xl font-black text-neutral-900">{stats.totalClinics}</p>
             </div>
             <div className="space-y-1">
                <span className="text-primary-500 text-[10px] font-black uppercase tracking-widest">Verified</span>
                <p className="text-3xl font-black text-neutral-900">{stats.verifiedClinics}</p>
             </div>
             <div className="space-y-1">
                <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Pending</span>
                <p className="text-3xl font-black text-neutral-900">{pendingClinics.length}</p>
             </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
           <button 
             onClick={() => setActiveTab('verification')}
             className={`w-full group p-8 rounded-[2.5rem] transition-all duration-500 flex flex-col items-start gap-4 border-2 ${activeTab === 'verification' ? 'bg-[#0f1715] border-[#0f1715] shadow-2xl scale-[1.02]' : 'bg-white border-neutral-100 hover:border-primary-100 hover:shadow-xl'}`}
           >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'verification' ? 'bg-primary-500 text-white' : 'bg-neutral-50 text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
                 <Icon name="check" size={28} />
              </div>
              <div className="text-left">
                 <h4 className={`text-xl font-black ${activeTab === 'verification' ? 'text-white' : 'text-neutral-900'}`}>Verify Queue</h4>
                 <p className={`text-sm font-medium mt-1 ${activeTab === 'verification' ? 'text-primary-100/40' : 'text-neutral-400'}`}>Manage facility audits</p>
              </div>
           </button>

           <button 
             onClick={() => setActiveTab('reports')}
             className={`w-full group p-8 rounded-[2.5rem] transition-all duration-500 flex flex-col items-start gap-4 border-2 ${activeTab === 'reports' ? 'bg-[#0f1715] border-[#0f1715] shadow-2xl scale-[1.02]' : 'bg-white border-neutral-100 hover:border-primary-100 hover:shadow-xl'}`}
           >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'reports' ? 'bg-primary-500 text-white' : 'bg-neutral-50 text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
                 <Icon name="chart-bar" size={28} />
              </div>
              <div className="text-left">
                 <h4 className={`text-xl font-black ${activeTab === 'reports' ? 'text-white' : 'text-neutral-900'}`}>Intelligence</h4>
                 <p className={`text-sm font-medium mt-1 ${activeTab === 'reports' ? 'text-primary-100/40' : 'text-neutral-400'}`}>System-wide analytics</p>
              </div>
           </button>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.03)] border border-neutral-50 min-h-[500px]">
         {activeTab === 'verification' && (
           <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-black text-neutral-900 font-outfit">Facility Audit Queue</h2>
                 <div className="flex gap-2">
                    <span className="w-3 h-3 bg-primary-500 rounded-full animate-ping"></span>
                    <span className="text-xs font-black text-primary-600 uppercase tracking-widest">Live Monitoring</span>
                 </div>
              </div>

              {pendingClinics.length === 0 ? (
                 <div className="py-32 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-neutral-100">
                       <Icon name="check" size={48} className="text-neutral-200" />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 mb-2">Queue Optimized</h3>
                    <p className="text-neutral-400 font-medium max-w-sm">No facilities are currently awaiting administrative verification.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {pendingClinics.map(clinic => (
                       <div key={clinic.id} className="p-8 rounded-[2.5rem] bg-neutral-50 border border-neutral-100 hover:bg-white hover:border-primary-200 hover:shadow-2xl transition-all duration-500 group">
                          <div className="flex justify-between items-start mb-8">
                             <div>
                                <h4 className="text-2xl font-black text-neutral-900 group-hover:text-primary-600 transition-colors">{clinic.name}</h4>
                                <div className="flex items-center gap-2 text-neutral-400 font-bold text-sm mt-1">
                                   <Icon name="map-pin" size={16} />
                                   {clinic.district}, {clinic.parish}
                                </div>
                             </div>
                             <div className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border border-yellow-100">Pending Review</div>
                          </div>
                          
                          <button 
                             onClick={() => verifyClinic(clinic.id)}
                             className="w-full py-5 bg-[#0f1715] hover:bg-primary-600 text-white rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                          >
                             <Icon name="check" size={20} />
                             Authorize Facility
                          </button>
                       </div>
                    ))}
                 </div>
              )}
           </div>
         )}

         {activeTab === 'reports' && (
           <div className="py-20 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="w-32 h-32 bg-primary-50 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner transform -rotate-6">
                 <Icon name="chart-bar" size={60} className="text-primary-600" />
              </div>
              <h2 className="text-4xl font-black text-neutral-900 mb-4 font-outfit">Intelligence Reports</h2>
              <p className="text-neutral-500 max-w-lg mx-auto font-medium mb-12 text-lg">Generate encrypted analytical reports covering facility density, service availability, and community health trends.</p>
              <button className="px-12 py-5 bg-[#0f1715] hover:bg-neutral-800 text-white rounded-[1.5rem] font-black transition-all shadow-2xl flex items-center gap-4 mx-auto group">
                 <Icon name="file-text" size={24} className="group-hover:translate-x-2 transition-transform" />
                 Download Master Analytics
              </button>
           </div>
         )}

         {activeTab === 'articles' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
             <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 font-outfit">Health Education Management</h2>
               <button className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 flex items-center gap-2 transition-all active:scale-95">
                <span>+ New Article</span>
              </button>
            </div>
            
            <div className="bg-white rounded-[2rem] p-20 shadow-sm border border-neutral-100 text-center flex flex-col items-center">
              <div className="w-32 h-32 bg-neutral-50 rounded-full flex items-center justify-center mb-8 border border-neutral-100 border-dashed">
                 <Icon name="calendar" size={60} className="text-neutral-200" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Knowledge Base is Empty</h3>
              <p className="text-neutral-500 max-w-sm mb-8 font-medium">Create and manage health education articles that appear for community members.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthBridgeAdminDashboard;
