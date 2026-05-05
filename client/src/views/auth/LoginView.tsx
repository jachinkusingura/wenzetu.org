import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/shared/Icon';

// Declare global variables for SDKs
declare global {
  interface Window {
    google: any;
    AppleID: any;
  }
}

const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Identity Services
    try {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "782937402934-hb-healthbridge-app.apps.googleusercontent.com", 
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Initialize Apple Sign In
        if (window.AppleID) {
          window.AppleID.auth.init({
            clientId: 'com.healthbridge.app.signin',
            scope: 'name email',
            redirectURI: window.location.origin + '/login',
            usePopup: true
          });
        }
      }
    } catch (error) {
      console.warn("Auth SDK init error:", error);
    }
  }, []);

  const handleGoogleResponse = (response: any) => {
    console.log("Google response:", response);
    try {
      // Decode the JWT token returned by Google
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const decoded = JSON.parse(jsonPayload);
      
      // Store the real user data in our mock session
      localStorage.setItem('authToken', 'google-oauth-token');
      localStorage.setItem('authUser', JSON.stringify({
        id: Date.now(),
        email: decoded.email,
        first_name: decoded.given_name || 'Google',
        last_name: decoded.family_name || 'User',
        role: 'patient'
      }));
      window.location.href = '/patient/dashboard';
    } catch (err) {
      console.error("Failed to decode Google token:", err);
      setError('Google Sign-In failed.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      if (window.AppleID) {
        const data = await window.AppleID.auth.signIn();
        console.log("Apple response:", data);
        
        // Apple returns an identity token and optionally a user object on first sign-in
        const userStr = data.user ? `${data.user.name.firstName} ${data.user.name.lastName}` : 'Apple User';
        
        localStorage.setItem('authToken', 'apple-oauth-token');
        localStorage.setItem('authUser', JSON.stringify({
          id: Date.now(),
          email: data.user?.email || 'appleuser@example.com',
          first_name: data.user?.name?.firstName || 'Apple',
          last_name: data.user?.name?.lastName || 'User',
          role: 'patient'
        }));
        window.location.href = '/patient/dashboard';
      }
    } catch (err) {
      console.error("Apple Sign-In error:", err);
      setError('Apple Sign-In failed or was cancelled.');
    }
  };

  const handleGoogleSignIn = () => {
    if (window.google) {
      setError('');
      window.google.accounts.id.prompt(); // Shows the native Google account picker
    } else {
      setError('Google SDK not loaded. Please refresh.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Login attempt for:', normalizedEmail);
      await login(normalizedEmail, password);
      console.log('Login successful, navigating...');
      navigate('/patient/dashboard');
    } catch (err: any) {
      console.error('Login component error:', err);
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Welcome back</h2>
      <p className="text-neutral-600 mb-8">Sign in to access your appointments and health records</p>

      {error && (
        <div className={`mb-6 p-4 rounded-lg text-sm border ${
          error.includes('successful') 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-neutral-700">
            <input type="checkbox" className="w-4 h-4 rounded" />
            Remember me
          </label>
          <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed gradient-purple"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-neutral-200"></div>
        <span className="text-neutral-500 text-sm">Or continue with</span>
        <div className="flex-1 h-px bg-neutral-200"></div>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-neutral-100 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 shadow-sm group"
        >
          <Icon name="google" size={20} />
          <span className="font-bold text-neutral-700 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">Google</span>
        </button>
        <button
          type="button"
          onClick={handleAppleSignIn}
          className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-black text-white hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-200"
        >
          <Icon name="apple" size={20} />
          <span className="font-bold text-xs sm:text-sm">Apple</span>
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-neutral-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginView;
