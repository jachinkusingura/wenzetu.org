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

const MEDICINE_OPTIONS = ['Paracetamol', 'Amoxicillin', 'Ciprofloxacin', 'Artemether', 'Insulin', 'Quinine', 'ARVs', 'Ibuprofen'];
const STOCK_OPTIONS = ['In Stock', 'Limited Stock', 'Out of Stock'];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'In Stock':       { bg: '#ecfdf5', text: '#065f46', dot: '#10b981' },
  'Limited Stock':  { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
  'Out of Stock':   { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
};

const ClinicAdminDashboardView: React.FC = () => {
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState('');
  const [medicineName, setMedicineName] = useState('Paracetamol');
  const [stockStatus, setStockStatus] = useState('In Stock');
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'details' | 'services' | 'inventory'>('details');
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!clinic || !newService.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/clinic-admin/services', {
        clinicId: clinic.id,
        serviceName: newService.trim()
      });
      setNewService('');
      fetchClinicData();
    } catch (error) {
      alert('Failed to add service. Please try again.');
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
      alert('Failed to update inventory. Please try again.');
    }
  };

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '400px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: 32
    }}>
      <div style={{
        width: 64, height: 64, border: '3px solid rgba(16,185,129,0.15)',
        borderTopColor: '#10b981', borderRadius: '50%',
        animation: 'spin 1s linear infinite', marginBottom: 20
      }} />
      <p style={{ color: '#059669', fontWeight: 800, letterSpacing: '0.2em', fontSize: 11, textTransform: 'uppercase' }}>
        Synchronising Clinical Records…
      </p>
    </div>
  );

  if (!clinic) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 300, textAlign: 'center', gap: 16
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Unable to Load Facility Data</h3>
      <p style={{ color: '#64748b', fontWeight: 500 }}>Could not synchronise with facility records. Please check your connection.</p>
    </div>
  );

  const navItems = [
    { key: 'details', label: 'Facility Details', icon: '🏥', desc: 'Name, contact & hours' },
    { key: 'services', label: 'Medical Services', icon: '🩺', desc: `${clinic.services.length} active services` },
    { key: 'inventory', label: 'Medicine Inventory', icon: '💊', desc: `${clinic.inventory.length} tracked items` },
  ] as const;

  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }} className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        borderRadius: 32, padding: '2.5rem 3rem', position: 'relative', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(6,78,59,0.4)'
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: 100, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(167,243,208,0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              🏥
            </div>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 100, color: '#a7f3d0', fontSize: 10,
                fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                Authorised Clinical Administrator
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {clinic.name}
              </h1>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: 14 }}>
                Clinical Operations &amp; Facility Management Console
              </p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              padding: '14px 32px', borderRadius: 18, cursor: saving ? 'not-allowed' : 'pointer',
              background: saveSuccess
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(12px)',
              color: '#fff', fontWeight: 800, fontSize: 15,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.4s ease', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              opacity: saving ? 0.7 : 1
            }}
            className="hover:bg-white/25 active:scale-95"
          >
            {saving ? '⏳ Saving…' : saveSuccess ? '✅ Changes Saved!' : '💾 Save All Changes'}
          </button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Active Services', value: clinic.services.length, icon: '🩺', color: '#10b981', bg: '#ecfdf5' },
          { label: 'Stocked Medicines', value: clinic.inventory.filter(i => i.status === 'In Stock').length, icon: '💊', color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Low Stock Alerts', value: clinic.inventory.filter(i => i.status === 'Limited Stock').length, icon: '⚠️', color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Operating Hours', value: `${clinic.opening_time} – ${clinic.closing_time}`, icon: '🕐', color: '#8b5cf6', bg: '#f5f3ff', small: true },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #f1f5f9', borderRadius: 18, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'all 0.3s ease'
          }}
            className="hover:-translate-y-0.5 hover:shadow-md"
          >
            <div style={{
              width: 46, height: 46, borderRadius: 14, background: kpi.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0
            }}>
              {kpi.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: (kpi as any).small ? 13 : 24, fontWeight: 900, color: kpi.color,
                lineHeight: 1, whiteSpace: (kpi as any).small ? 'nowrap' : undefined,
                overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Nav ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {navItems.map(nav => {
          const active = activeSection === nav.key;
          return (
            <button
              key={nav.key}
              onClick={() => setActiveSection(nav.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                borderRadius: 14, cursor: 'pointer',
                background: active ? 'linear-gradient(135deg, #064e3b, #065f46)' : '#fff',
                border: active ? 'none' : '1px solid #e2e8f0',
                boxShadow: active ? '0 8px 24px rgba(6,78,59,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: 18 }}>{nav.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: active ? '#fff' : '#0f172a' }}>{nav.label}</div>
                <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.5)' : '#94a3b8', fontWeight: 500 }}>{nav.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Content Area ── */}
      <div style={{
        background: '#fff', borderRadius: 28, padding: '36px 40px',
        border: '1px solid #f1f5f9', boxShadow: '0 8px 40px rgba(0,0,0,0.04)', minHeight: 400
      }}>

        {/* Facility Details */}
        {activeSection === 'details' && (
          <div className="animate-in fade-in zoom-in-95 duration-400">
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>Core Facility Information</h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                Update your facility's registered details — changes apply immediately upon saving.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {[
                { label: 'Registered Facility Name', name: 'name', value: clinic.name, type: 'text', icon: '🏥' },
                { label: 'Primary Contact Number', name: 'phone', value: clinic.phone, type: 'tel', icon: '📞' },
                { label: 'Daily Opening Time', name: 'opening_time', value: clinic.opening_time, type: 'time', icon: '🌅' },
                { label: 'Daily Closing Time', name: 'closing_time', value: clinic.closing_time, type: 'time', icon: '🌙' },
              ].map(field => (
                <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{field.icon}</span> {field.label}
                  </label>
                  <input
                    name={field.name}
                    value={field.value}
                    onChange={handleUpdateClinic}
                    type={field.type}
                    style={{
                      padding: '14px 18px', border: '2px solid #e2e8f0', borderRadius: 14,
                      fontSize: 15, fontWeight: 600, color: '#0f172a',
                      background: '#f8fafc', outline: 'none', width: '100%',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {activeSection === 'services' && (
          <div className="animate-in fade-in zoom-in-95 duration-400">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>Medical Services Offered</h2>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                  Services listed here are visible to patients searching on HealthBridge.
                </p>
              </div>
              <span style={{
                padding: '6px 16px', borderRadius: 100, background: '#ecfdf5',
                color: '#065f46', fontSize: 12, fontWeight: 800
              }}>
                {clinic.services.length} Active Services
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
              {clinic.services.map((s, i) => (
                <div key={i} style={{
                  padding: '8px 18px', borderRadius: 100,
                  background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                  border: '1px solid #a7f3d0', color: '#065f46', fontWeight: 700, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  {s}
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', gap: 12, padding: 20, background: '#f8fafc',
              borderRadius: 18, border: '2px dashed #e2e8f0', flexWrap: 'wrap'
            }}>
              <input
                value={newService}
                onChange={e => setNewService(e.target.value)}
                placeholder="Enter a new service (e.g., Physiotherapy, Radiology)"
                onKeyDown={e => e.key === 'Enter' && handleAddService()}
                style={{
                  flex: 1, minWidth: 200, padding: '12px 18px', border: '2px solid #e2e8f0',
                  borderRadius: 12, fontSize: 14, fontWeight: 500, background: '#fff',
                  outline: 'none', color: '#0f172a'
                }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={handleAddService}
                style={{
                  padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #064e3b, #065f46)',
                  color: '#fff', fontWeight: 800, fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 6px 20px rgba(6,78,59,0.3)', transition: 'all 0.3s ease'
                }}
                className="hover:opacity-90 active:scale-95"
              >
                + Add Service
              </button>
            </div>
          </div>
        )}

        {/* Inventory */}
        {activeSection === 'inventory' && (
          <div className="animate-in fade-in zoom-in-95 duration-400">
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>Medicine Inventory Management</h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                Keep stock status up to date — patients rely on this information when choosing your facility.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Update form */}
              <div style={{
                padding: 28, background: 'linear-gradient(135deg, #064e3b, #065f46)',
                borderRadius: 24, boxShadow: '0 20px 60px rgba(6,78,59,0.35)'
              }}>
                <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 800, color: '#fff' }}>Update Stock Level</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>
                      Medicine Name
                    </label>
                    <select
                      value={medicineName}
                      onChange={e => setMedicineName(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                        color: '#fff', fontWeight: 600, fontSize: 14, outline: 'none', cursor: 'pointer'
                      }}
                    >
                      {MEDICINE_OPTIONS.map(m => <option key={m} style={{ background: '#064e3b' }}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>
                      Current Stock Status
                    </label>
                    <select
                      value={stockStatus}
                      onChange={e => setStockStatus(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                        color: '#fff', fontWeight: 600, fontSize: 14, outline: 'none', cursor: 'pointer'
                      }}
                    >
                      {STOCK_OPTIONS.map(s => <option key={s} style={{ background: '#064e3b' }}>{s}</option>)}
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateStock}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                      background: '#fff', color: '#064e3b', fontWeight: 900, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all 0.3s ease', marginTop: 8
                    }}
                    className="hover:bg-emerald-50 active:scale-95"
                  >
                    💾 Update Inventory Record
                  </button>
                </div>
              </div>

              {/* Current inventory */}
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Current Stock Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {clinic.inventory.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontWeight: 600, background: '#f8fafc', borderRadius: 16 }}>
                      💊 No inventory records yet. Update the form to add your first entry.
                    </div>
                  ) : clinic.inventory.map((item, i) => {
                    const style = STATUS_COLORS[item.status] || STATUS_COLORS['Out of Stock'];
                    return (
                      <div key={i} style={{
                        padding: '14px 18px', borderRadius: 14, background: '#f8fafc',
                        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>💊</span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{item.name}</span>
                        </div>
                        <span style={{
                          padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 800,
                          background: style.bg, color: style.text,
                          display: 'flex', alignItems: 'center', gap: 5
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, display: 'inline-block' }} />
                          {item.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicAdminDashboardView;
