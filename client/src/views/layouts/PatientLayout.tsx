import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/shared/Icon';

const PatientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: 'chart-bar' as const },
    { name: 'Appointments', path: '/patient/appointments', icon: 'calendar' as const },
    { name: 'Saved Clinics', path: '/patient/saved-clinics', icon: 'hospital' as const },
    { name: 'My Profile', path: '/patient/profile', icon: 'user' as const },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col sticky top-0 h-screen z-40`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-purple flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
            <span className="text-white font-bold text-xl">+</span>
          </div>
          {isSidebarOpen && <span className="font-bold text-xl text-neutral-900 tracking-tight">HealthBridge</span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/patient/dashboard' && location.pathname === '/patient');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600 shadow-sm' 
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <Icon 
                  name={item.icon} 
                  size={22} 
                  className={isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'} 
                />
                {isSidebarOpen && <span className="font-semibold">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <Icon name="logout" size={22} className="text-neutral-400 group-hover:text-red-500" />
            {isSidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-neutral-900">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors">
              <Icon name="bell" size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-neutral-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-neutral-900 leading-none">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-neutral-500 mt-1 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-white shadow-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
