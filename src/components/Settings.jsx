import React, { useState } from 'react';
import { Save, Store, User, Settings2, Moon, Sun, Lock, ShieldCheck } from 'lucide-react';

export default function Settings({ settings, setSettings, currentUser, setCurrentUser, users = [], setUsers = () => {} }) {
  const [form, setForm] = useState({ ...settings });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Profile Edit States
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');

  const isModerator = currentUser?.role === 'Moderator';

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    if (isModerator) {
      alert('Access Denied: Moderators cannot change settings.');
      return;
    }
    setSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Resize using canvas to avoid large base64 string crashing localStorage
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setProfileAvatar(dataUrl);
          } else {
            setProfileAvatar(reader.result);
          }
        };
        img.onerror = () => {
          setProfileAvatar(reader.result);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    const newEmail = profileEmail.trim();
    if (!newEmail || !newEmail.includes('@') || !newEmail.includes('.')) {
      alert('Please enter a valid email address!');
      return;
    }

    // Check duplicate email
    if (users && currentUser) {
      const duplicate = users.find(
        u => u.email.toLowerCase() === newEmail.toLowerCase() && u.id !== currentUser.id
      );
      if (duplicate) {
        alert('This email address is already in use by another user!');
        return;
      }
    }

    // Validate password change if attempted
    let updatedPassword = currentUser.password;
    if (passwordForm.newPassword) {
      if (passwordForm.currentPassword !== currentUser.password) {
        alert('Incorrect current password!');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('New password and confirm password do not match!');
        return;
      }
      if (passwordForm.newPassword.length < 4) {
        alert('Password must be at least 4 characters long!');
        return;
      }
      updatedPassword = passwordForm.newPassword;
    }

    const updatedUser = {
      ...currentUser,
      name: profileName,
      email: newEmail,
      avatar: profileAvatar,
      password: updatedPassword
    };

    // Update session and user list states
    setCurrentUser(updatedUser);
    
    if (users && setUsers) {
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
    }

    setProfileSuccess(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleToggleTheme = () => {
    const newTheme = form.theme === 'light' ? 'dark' : 'light';
    const updated = { ...form, theme: newTheme };
    setForm(updated);
    setSettings(updated);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome Title */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admin & Store Settings ⚙️</h2>
          <p className="text-sm text-gray-500 mt-1">Change store general information, currency, theme, and admin account settings.</p>
        </div>
        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
          <Settings2 className="w-6 h-6" />
        </div>
      </div>

      {isModerator && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <ShieldCheck className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
          <span>Moderator Notice: You have read-only access. You cannot update settings.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar inside Settings */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-2">
          <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Settings Categories</div>
          <a href="#general" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl">
            <Store className="w-4 h-4" /> Store Settings
          </a>
          <a href="#profile" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
            <User className="w-4 h-4" /> Admin Account
          </a>
          <button
            onClick={handleToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {form.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              Appearance Mode
            </span>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-extrabold capitalize">
              {form.theme}
            </span>
          </button>
        </div>

        {/* Setting Forms Area */}
        <div className="md:col-span-2 space-y-6">
          {/* General Store settings */}
          <form id="general" onSubmit={handleSaveGeneral} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50 mb-2">
              <Store className="w-5 h-5 text-gray-400" />
              <h3 className="text-base font-bold text-gray-900">General Store Information</h3>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-150 animate-in fade-in duration-200">
                <ShieldCheck className="w-4 h-4" /> Store settings successfully saved!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Store Name</label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  required
                  disabled={isModerator}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Contact Email</label>
                <input
                  type="email"
                  value={form.storeEmail}
                  onChange={(e) => setForm({ ...form, storeEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  required
                  disabled={isModerator}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Currency Symbol</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  required
                  disabled={isModerator}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tax Rate (%)</label>
                <input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  required
                  disabled={isModerator}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Shipping Fee (৳)</label>
                <input
                  type="number"
                  value={form.shippingFee}
                  onChange={(e) => setForm({ ...form, shippingFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  required
                  disabled={isModerator}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isModerator}
                className={`font-semibold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all text-sm ${
                  isModerator 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                <Save className="w-4 h-4" /> General Save
              </button>
            </div>
          </form>

          {/* Admin Profile Details */}
          <form id="profile" onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50 mb-2">
              <User className="w-5 h-5 text-gray-400" />
              <h3 className="text-base font-bold text-gray-900">Personal Profile & Security</h3>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-150 animate-in fade-in duration-200">
                <ShieldCheck className="w-4.5 h-4.5 text-green-600 flex-shrink-0" /> Profile successfully updated!
              </div>
            )}

            {/* Profile Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-gray-50">
              <div className="relative group">
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt="Profile Avatar Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-xl border-2 border-white shadow-md">
                    {profileName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <label className="block text-xs font-bold text-gray-500 uppercase">Change Profile Picture</label>
                <div className="flex items-center gap-2 mt-1">
                  <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 cursor-pointer transition-colors">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  {profileAvatar && (
                    <button
                      type="button"
                      onClick={() => setProfileAvatar('')}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Your Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Login Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-gray-50 space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <Lock className="w-4 h-4 text-gray-400" /> Security Update
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                    <input
                      type="password"
                      placeholder="At least 4 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Type again"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="font-semibold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all text-sm bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Profile & Security
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
