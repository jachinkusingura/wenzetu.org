import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-purple">
              <span className="text-white text-2xl font-bold">+</span>
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">HealthBridge</h1>
          <p className="mt-2 text-neutral-300">Book healthcare appointments easily</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-neutral-400 text-sm">
          HealthBridge © {new Date().getFullYear()} - Expert Medical Care
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
