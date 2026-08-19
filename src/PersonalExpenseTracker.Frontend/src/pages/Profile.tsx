import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { User, KeyRound } from 'lucide-react';

export const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newName, setNewName] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/profile');
        setName(data.name);
        setEmail(data.email);
        setNewName(data.name);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    setIsUpdatingName(true);
    try {
      await apiClient.put('/profile/name', { newName });
      setName(newName);
      toast.success('Name updated successfully');
    } catch (error) {
      // Toast is handled by interceptor
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.put('/profile/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Toast is handled by interceptor
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-600">Manage your personal information and password.</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center">
          <User className="h-5 w-5 text-slate-500 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-slate-900">General Information</h3>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email (Read-only)</label>
              <input
                type="email"
                disabled
                value={email}
                className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm text-slate-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                id="name"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingName || newName === name}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isUpdatingName ? 'Saving...' : 'Update Name'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center">
          <KeyRound className="h-5 w-5 text-slate-500 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-slate-900">Change Password</h3>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="current" className="block text-sm font-medium text-slate-700">Current Password</label>
              <input
                type="password"
                id="current"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="new" className="block text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                id="new"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                type="password"
                id="confirm"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
