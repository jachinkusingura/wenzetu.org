import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/shared/Icon';

const ClinicLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-outfit">
      {/* Clinic Admin Navbar */}
      <nav className="bg-[#0f1715] text-white py-4 px-8 shadow-2xl sticky top-0 z-50 border-b border-white/10 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/clinic/dashboard" className="flex items-center gap-3 group transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Icon name="hospital" size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Health<span className="text-primary-400">Bridge</span>
              <span className="ml-2 text-[10px] uppercase tracking-[0.2em] bg-white/10 px-2 py-0.5 rounded text-white/60 font-semibold">Clinic</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/clinic/dashboard')}
              className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all border border-white/10 hover:border-white/20 active:scale-95"
            >
              My Clinic Panel
            </button>
            <button 
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold transition-all border border-red-500/20 hover:border-red-500/40 active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-10">
        <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-8 shadow-sm border border-white/60 min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Branded Footer */}
      <footer className="bg-[#0f1715] text-white/40 py-12 px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-medium tracking-wide">© 2025 HealthBridge – Privacy-first health locator</p>
        </div>
      </footer>
    </div>
  );
};

export default ClinicLayout;
