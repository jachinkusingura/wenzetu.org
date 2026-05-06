import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../components/shared/Icon';

interface ClinicData {
  id: number;
  name: string;
  phone: string;
  opening_time: string;
  closing_time: string;
  services: string[];
  inventory: { name: string; status: string }[];
}

const ClinicAdminDashboardView: React.FC = () => {
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState('');
  const [medicineName, setMedicineName] = useState('Paracetamol');
  const [stockStatus, setStockStatus] = useState('In Stock');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClinicData();
  }, []);

  const fetchClinicData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clinic-admin/my-clinic');
      setClinic(response.data);
    } catch (error) {
      console.error('Error fetching clinic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClinic = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clinic) return;
    const { name, value } = e.target;
    setClinic({ ...clinic, [name]: value });
  };

  const handleSaveAll = async () => {
    if (!clinic) return;
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/clinic-admin/my-clinic/${clinic.id}`, clinic);
      alert('Changes saved successfully!');
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!clinic || !newService) return;
    try {
      await axios.post('http://localhost:5000/api/clinic-admin/services', {
        clinicId: clinic.id,
        serviceName: newService
      });
      setNewService('');
      fetchClinicData();
    } catch (error) {
      alert('Failed to add service');
    }
  };

  const handleUpdateStock = async () => {
    if (!clinic) return;
    try {
      await axios.post('http://localhost:5000/api/clinic-admin/medicine-stock', {
        clinicId: clinic.id,
        medicineName,
        status: stockStatus
      });
      fetchClinicData();
    } catch (error) {
      alert('Failed to update stock');
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
       <div className="inline-block animate-bounce rounded-full h-12 w-12 bg-primary-100 flex items-center justify-center mb-4 mx-auto">
          <Icon name="hospital" size={24} className="text-primary-600" />
       </div>
       <p className="text-neutral-400 font-black uppercase text-xs tracking-widest">Loading Clinical Data...</p>
    </div>
  );
  
  if (!clinic) return <div className="p-20 text-center text-red-500 font-bold">Failed to synchronize with facility records.</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Clinic Header Card */}
      <div className="bg-gradient-to-br from-white to-primary-50/30 rounded-[3rem] p-12 shadow-[0_20px_80px_rgba(0,0,0,0.03)] border border-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary-400/5 rounded-full blur-3xl -ml-16 -mt-16"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-primary-600 shadow-xl border border-primary-50 transform hover:scale-105 transition-transform">
            <Icon name="hospital" size={48} />
          </div>
          <div>
            <span className="px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Authorized Administrator</span>
            <h1 className="text-5xl font-black text-neutral-900 mt-4 tracking-tighter font-outfit leading-none">
              {clinic.name}
            </h1>
            <p className="text-neutral-500 font-semibold mt-2 flex items-center gap-2">
               <Icon name="map-pin" size={16} className="text-primary-400" />
               Clinical Management Dashboard
            </p>
          </div>
        </div>
        
        <button 
           onClick={handleSaveAll}
           disabled={saving}
           className="px-10 py-5 bg-[#0f1715] hover:bg-primary-600 text-white rounded-[1.5rem] font-black transition-all shadow-2xl active:scale-95 flex items-center gap-4 group relative z-10"
        >
           <Icon name="star" size={24} className="text-primary-400 group-hover:text-white" />
           <span>{saving ? 'Syncing...' : 'Apply System Updates'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Facility Settings */}
         <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-neutral-100">
               <h3 className="text-2xl font-black text-neutral-900 mb-8 font-outfit">Core Facility Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Registered Name</label>
                     <input 
                        name="name"
                        value={clinic.name}
                        onChange={handleUpdateClinic}
                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-neutral-800"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Contact Line</label>
                     <input 
                        name="phone"
                        value={clinic.phone}
                        onChange={handleUpdateClinic}
                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-neutral-800"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Operations Start</label>
                     <input 
                        name="opening_time"
                        value={clinic.opening_time}
                        onChange={handleUpdateClinic}
                        type="time"
                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-neutral-800"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Operations End</label>
                     <input 
                        name="closing_time"
                        value={clinic.closing_time}
                        onChange={handleUpdateClinic}
                        type="time"
                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-neutral-800"
                     />
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-neutral-100">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-neutral-900 font-outfit">Medical Services</h3>
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{clinic.services.length} Active</span>
               </div>
               
               <div className="flex flex-wrap gap-3 mb-8">
                  {clinic.services.map((s, i) => (
                    <div key={i} className="px-5 py-2.5 bg-neutral-50 text-neutral-700 rounded-2xl text-sm font-bold border border-neutral-100 flex items-center gap-2 group hover:bg-primary-600 hover:text-white transition-all cursor-default">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary-500 group-hover:bg-white"></div>
                       {s}
                    </div>
                  ))}
               </div>

               <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Identify new service (e.g., Surgery, Counseling)"
                    className="flex-1 px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-medium italic"
                  />
                  <button 
                    onClick={handleAddService}
                    className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95 flex items-center gap-3"
                  >
                    <Icon name="check" size={18} />
                    Link Service
                  </button>
               </div>
            </div>
         </div>

         {/* Inventory Management */}
         <div className="space-y-8">
            <div className="bg-[#0f1715] rounded-[3rem] p-10 shadow-2xl border border-white/5 h-full">
               <div className="w-16 h-16 bg-primary-500/20 rounded-[1.5rem] flex items-center justify-center mb-6">
                  <Icon name="chart-bar" size={32} className="text-primary-400" />
               </div>
               <h3 className="text-2xl font-black text-white mb-2 font-outfit">Inventory Matrix</h3>
               <p className="text-primary-100/40 text-sm font-medium mb-10 leading-relaxed">Ensure community visibility of essential medicine availability.</p>
               
               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] ml-2">Resource Name</label>
                     <select 
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold appearance-none cursor-pointer hover:bg-white/10 transition-all"
                     >
                        <option className="bg-[#0f1715]">Paracetamol</option>
                        <option className="bg-[#0f1715]">Amoxicillin</option>
                        <option className="bg-[#0f1715]">Ciprofloxacin</option>
                        <option className="bg-[#0f1715]">Artemether</option>
                        <option className="bg-[#0f1715]">Insulin</option>
                     </select>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] ml-2">Stock Condition</label>
                     <select 
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value)}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold appearance-none cursor-pointer hover:bg-white/10 transition-all"
                     >
                        <option className="bg-[#0f1715]">In Stock</option>
                        <option className="bg-[#0f1715]">Limited Stock</option>
                        <option className="bg-[#0f1715]">Out of Stock</option>
                     </select>
                  </div>

                  <button 
                    onClick={handleUpdateStock}
                    className="w-full py-5 bg-white text-[#0f1715] hover:bg-primary-400 rounded-2xl font-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    Update Matrix
                  </button>
               </div>

               <div className="mt-12 space-y-3">
                  <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] ml-2">Current Status</span>
                  <div className="grid grid-cols-1 gap-3">
                     {clinic.inventory.slice(0, 3).map((item, i) => (
                       <div key={i} className="px-5 py-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                          <span className="text-sm font-bold text-white">{item.name}</span>
                          <span className={`text-[10px] font-black uppercase ${item.status === 'In Stock' ? 'text-primary-400' : 'text-red-400'}`}>{item.status}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ClinicAdminDashboardView;
