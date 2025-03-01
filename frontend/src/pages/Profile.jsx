import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { AlertCircle, Loader2, UserCircle, Camera } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, updatePassword, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profilePic, setProfilePic] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    console.log('🔄 Profile page rendered with user:', user?.name);
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      console.error('❌ Profile error state:', error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`🖊️ Profile form field changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    
    // Clear password error when typing
    if (passwordError) setPasswordError('');
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('🖼️ Profile pic selected:', file.name, file.size, 'bytes');
      setProfilePic(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Submitting profile update', formData);
    setSuccessMessage('');
    
    try {
      console.log('📤 Updating profile data');
      await updateProfile(formData);
      console.log('✅ Profile data updated successfully');
      
      // If there's a profile pic, upload it separately
      if (profilePic) {
        const picFormData = new FormData();
        picFormData.append('profilePic', profilePic);
        console.log('🖼️ Uploading profile picture:', profilePic.name);
        await useAuthStore.getState().updateProfilePic(picFormData);
        console.log('✅ Profile picture uploaded successfully');
        setProfilePic(null);
      }
      
      setSuccessMessage('Profile updated successfully');
      console.log('✅ Profile update complete');
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      // Error is handled by the store and displayed below
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setPasswordError('');
    
    // Validate passwords
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      console.log('🔒 Updating password');
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      console.log('✅ Password updated successfully');
      setSuccessMessage('Password updated successfully');
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('❌ Failed to update password:', err);
      // Error is handled by the store and displayed below
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Your Profile</h1>
      
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
        </div>
      )}

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Profile Details
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('password')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Change Password
            </button>
          </li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {activeTab === 'details' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-24 w-24 text-gray-400" />
                  )}
                  <label htmlFor="profile-pic" className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer">
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      id="profile-pic"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {profilePic && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {profilePic.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm bg-gray-50 dark:bg-gray-600"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    placeholder="Tell us about yourself"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 w-full justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Profile</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                
                {passwordError && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {passwordError}
                  </div>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 w-full justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}