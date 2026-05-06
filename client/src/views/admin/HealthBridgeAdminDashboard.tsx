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
      fetchData();
    } catch (error) {
      alert('Failed to verify clinic');
    }
  };

  const pendingClinics = clinics.filter(c => !c.is_verified);
  const verificationProgress = stats.totalClinics > 0
    ? (stats.verifiedClinics / stats.totalClinics) * 100
    : 0;

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '400px', background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 100%)'
    }}>
      <div style={{
        width: 64, height: 64, border: '3px solid rgba(251,191,36,0.15)',
        borderTopColor: '#fbbf24', borderRadius: '50%',
        animation: 'spin 1s linear infinite', marginBottom: 20
      }} />
      <p style={{ color: '#fbbf24', fontWeight: 800, letterSpacing: '0.25em', fontSize: 11, textTransform: 'uppercase' }}>
        Initialising HealthBridge Command Centre…
      </p>
    </div>
  );

  const tabs = [
    { key: 'verification', label: 'Verification Queue', sub: 'Review & approve facilities', icon: 'check' },
    { key: 'reports', label: 'Analytics & Reports', sub: 'Network-wide intelligence', icon: 'chart-bar' },
  ] as const;

  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }} className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 60%, #112240 100%)',
        borderRadius: 32, padding: '3rem', position: 'relative', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
      }}>
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
          background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Gold badge icon */}
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 40px rgba(245,158,11,0.45)',
              fontSize: 36, flexShrink: 0
            }}>
              🏥
            </div>
            <div>
              <div style={{
                display: 'inline-block', padding: '4px 14px',
                background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)',
                borderRadius: 100, color: '#fbbf24', fontSize: 10,
                fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10
              }}>
                HealthBridge · Central Command
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                National Health{' '}
                <span style={{ color: '#fbbf24' }}>Network</span>{' '}
                Console
              </h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.45)', fontWeight: 500, fontSize: 15 }}>
                Oversee, verify, and optimise Uganda's healthcare facility ecosystem
              </p>
            </div>
          </div>

          {/* Live status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 16, backdropFilter: 'blur(12px)'
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', background: '#34d399',
              boxShadow: '0 0 10px #34d399', animation: 'pulse 2s infinite'
            }} />
            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>System Status</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>All Systems Operational</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Facilities', value: stats.totalClinics, color: '#6366f1', bg: 'rgba(99,102,241,0.08)', icon: '🏥' },
          { label: 'Verified & Active', value: stats.verifiedClinics, color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: '✅' },
          { label: 'Pending Review', value: pendingClinics.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '⏳' },
          { label: 'Coverage Rate', value: `${Math.round(verificationProgress)}%`, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', icon: '📊' },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20,
            padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease', cursor: 'default'
          }}
            className="hover:shadow-lg hover:-translate-y-0.5"
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: kpi.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
            }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Coverage Progress ── */}
      <div style={{
        background: '#fff', borderRadius: 24, padding: '32px 36px',
        border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>National Facility Coverage</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13, fontWeight: 500 }}>Real-time verification progress across all registered districts</p>
          </div>
          <span style={{
            fontSize: 38, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            {Math.round(verificationProgress)}%
          </span>
        </div>
        <div style={{ height: 12, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 100,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
            width: `${verificationProgress}%`,
            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)'
          }} />
        </div>
      </div>

      {/* ── Main Workspace ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 20 }} className="lg:grid-cols-[1fr_3fr]">

        {/* Sidebar Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tabs.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                  padding: '20px 22px', borderRadius: 20, cursor: 'pointer',
                  background: active ? 'linear-gradient(135deg, #0a0f1e, #112240)' : '#fff',
                  border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid #f1f5f9',
                  boxShadow: active ? '0 20px 40px rgba(10,15,30,0.4)' : '0 2px 8px rgba(0,0,0,0.04)',
                  transform: active ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: active ? 'rgba(251,191,36,0.15)' : '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                }}>
                  {tab.icon === 'check' ? '✅' : '📈'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: active ? '#fff' : '#0f172a' }}>{tab.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: active ? 'rgba(255,255,255,0.4)' : '#94a3b8', marginTop: 2 }}>{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div style={{
          background: '#fff', borderRadius: 28, padding: '36px 40px',
          border: '1px solid #f1f5f9', boxShadow: '0 8px 40px rgba(0,0,0,0.04)', minHeight: 500
        }}>

          {activeTab === 'verification' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#0f172a' }}>Facility Approval Queue</h2>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                    Review and authorise healthcare facilities awaiting network entry
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Live Monitoring</span>
                </div>
              </div>

              {pendingClinics.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
                  <div style={{
                    width: 96, height: 96, background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                    borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 44, marginBottom: 24, boxShadow: '0 8px 24px rgba(16,185,129,0.15)'
                  }}>✅</div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>All Clear — Queue is Empty</h3>
                  <p style={{ margin: '10px 0 0', color: '#64748b', fontWeight: 500, maxWidth: 360 }}>
                    Every submitted facility has been reviewed. No clinics are currently awaiting authorisation.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {pendingClinics.map(clinic => (
                    <div key={clinic.id} style={{
                      padding: 28, borderRadius: 24,
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.4s ease'
                    }}
                      className="hover:bg-white hover:border-indigo-200 hover:shadow-2xl group"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{clinic.name}</h4>
                          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                            📍 {clinic.district}, {clinic.parish}
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 12px', borderRadius: 100, fontSize: 10, fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          background: '#fef9c3', color: '#92400e', border: '1px solid #fde68a'
                        }}>Pending</span>
                      </div>
                      <button
                        onClick={() => verifyClinic(clinic.id)}
                        style={{
                          width: '100%', padding: '14px 0', borderRadius: 16, border: 'none',
                          background: 'linear-gradient(135deg, #0a0f1e, #1e3a5f)',
                          color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: '0 8px 24px rgba(10,15,30,0.25)',
                          transition: 'all 0.3s ease'
                        }}
                        className="hover:opacity-90 active:scale-95"
                      >
                        ✅ Authorise This Facility
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-in fade-in zoom-in-95 duration-500" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
              <div style={{
                width: 120, height: 120, borderRadius: 36,
                background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 56, marginBottom: 28, boxShadow: '0 12px 40px rgba(99,102,241,0.2)'
              }}>📊</div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: '#0f172a' }}>Intelligence Reports</h2>
              <p style={{ margin: '12px 0 32px', color: '#64748b', maxWidth: 460, lineHeight: 1.7, fontSize: 15 }}>
                Generate comprehensive analytical reports covering facility density, service availability, regional health trends, and community impact metrics across Uganda.
              </p>
              <button style={{
                padding: '16px 40px', borderRadius: 18, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #0a0f1e, #1e3a5f)',
                color: '#fff', fontWeight: 800, fontSize: 15,
                display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto',
                boxShadow: '0 16px 40px rgba(10,15,30,0.3)', transition: 'all 0.3s ease'
              }}
                className="hover:opacity-90 active:scale-95"
              >
                📥 Download Master Analytics
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthBridgeAdminDashboard;
