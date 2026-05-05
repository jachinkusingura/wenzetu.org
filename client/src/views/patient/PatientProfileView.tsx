import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import Icon from '../../components/shared/Icon';

const PatientProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await patientService.getProfile();
      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || ''
      });
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await patientService.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading profile...</p></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Profile</h1>
        <p className="text-neutral-600">Manage your personal information and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar - Profile Picture & Status */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-purple flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-neutral-600 text-sm mb-6">{profile?.email}</p>
            <button className="w-full px-4 py-2 rounded-lg border border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-colors">
              Change Avatar
            </button>
          </div>
        </div>

        {/* Main Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">Personal Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2 rounded-xl border-2 border-primary-600 text-primary-600 font-bold hover:bg-primary-50 transition-all active:scale-95"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-neutral-700">{profile?.first_name || 'Not provided'}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-neutral-700">{profile?.last_name || 'Not provided'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Email Address
                </label>
                <p className="text-neutral-700">{profile?.email}</p>
                <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-neutral-700">{profile?.phone || 'Not provided'}</p>
                )}
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Member Since
                </label>
                <p className="text-neutral-700">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Save Button */}
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-purple text-white font-bold shadow-xl shadow-purple-200 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-8">
        <h3 className="text-2xl font-bold text-neutral-900 mb-6">Account Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div>
              <p className="font-semibold text-neutral-900">Email Notifications</p>
              <p className="text-sm text-neutral-600">Receive appointment reminders and updates</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div>
              <p className="font-semibold text-neutral-900">SMS Notifications</p>
              <p className="text-sm text-neutral-600">Receive SMS updates about appointments</p>
            </div>
            <input type="checkbox" className="w-5 h-5 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900">Two-Factor Authentication</p>
              <p className="text-sm text-neutral-600">Add extra security to your account</p>
            </div>
            <button className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors font-semibold">
              Enable
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-8">
        <h3 className="text-2xl font-bold text-red-900 mb-4">Danger Zone</h3>
        <p className="text-red-800 mb-4">These actions cannot be undone. Please be careful.</p>
        
        <button className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default PatientProfileView;
