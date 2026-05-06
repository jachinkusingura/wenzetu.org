import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/shared/Icon';

const RegisterView: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
      setError('Google Sign-Up failed.');
    }
  };

  React.useEffect(() => {
    // Initialize Google Identity Services
    try {
      if (window.google && !window.google._initialized) {
        window.google.accounts.id.initialize({
          client_id: "782937402934-hb-healthbridge-app.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          auto_select: false
        });
        window.google._initialized = true;
      }

      if (window.google) {
        // Render the real Google button
        window.google.accounts.id.renderButton(
          document.getElementById("googleButton"),
          { 
            theme: "outline", 
            size: "large", 
            width: "100%",
            text: "signup_with",
            shape: "rectangular",
            logo_alignment: "left"
          }
        );
      }
    } catch (error) {
      console.warn("Google SDK init error:", error);
    }

    // Apple setup
    try {
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: 'com.healthbridge.app.signin',
          scope: 'name email',
          redirectURI: window.location.origin + '/login',
          usePopup: true
        });
      }
    } catch (error) {
      console.warn("Apple SDK init error:", error);
    }
  }, []);

  const handleAppleSignUp = async () => {
    try {
      if (window.AppleID) {
        const data = await window.AppleID.auth.signIn();
        console.log("Apple response:", data);
        
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
      console.error("Apple Sign-Up error:", err);
      setError('Apple Sign-Up failed or was cancelled.');
    }
  };

  const handleGoogleSignUp = () => {
    if (window.google) {
      setError('');
      window.google.accounts.id.prompt(); // Shows the native Google account picker
    } else {
      setError('Google SDK not loaded. Please refresh.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      await register(normalizedEmail, formData.password, formData.firstName, formData.lastName, formData.role);
      
      // Role-based redirection
      if (formData.role === 'hb_admin') {
        navigate('/admin/dashboard');
      } else if (formData.role === 'clinic_admin') {
        navigate('/clinic/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Create an account</h2>
      <p className="text-neutral-600 mb-8">Join HealthBridge to book medical appointments</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
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
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <p className="mt-2 text-xs text-neutral-500">Minimum 6 characters</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Sign up as
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={(e: any) => handleChange(e)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
          >
            <option value="patient">Community Member</option>
            <option value="clinic_admin">Clinical Administrator</option>
            <option value="hb_admin">HealthBridge Admin</option>
          </select>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input type="checkbox" className="w-5 h-5 rounded mt-0.5" required />
          <span>
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
              Terms & Conditions
            </a>
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed gradient-purple"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-neutral-200"></div>
        <span className="text-neutral-500 text-sm">Or sign up with</span>
        <div className="flex-1 h-px bg-neutral-200"></div>
      </div>

      {/* Social Sign Up */}
      <div className="space-y-4">
        {/* Native Google Button */}
        <div id="googleButton" className="w-full h-[44px]"></div>

        {/* Apple Button */}
        <button
          type="button"
          onClick={handleAppleSignUp}
          className="w-full h-[44px] flex items-center justify-center gap-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-sm font-semibold text-sm"
        >
          <Icon name="apple" size={18} />
          <span>Continue with Apple</span>
        </button>
      </div>

      {/* Sign In Link */}
      <p className="mt-8 text-center text-neutral-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterView;
