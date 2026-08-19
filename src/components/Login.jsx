import React, { useState } from 'react';
import { Shirt, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import loginLogo from '../assets/images/G.png'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(), password
    });
    if (signInError || !data.user) {
      setError(signInError?.message || 'Could not sign in.');
      return;
    }
    const { data: role, error: roleError } = await supabase.rpc('get_my_admin_role');
    if (roleError || !role) {
      await supabase.auth.signOut();
      setError('This account does not have admin-panel access. Ask a Super Admin to add your email.');
      return;
    }
    onLogin({ id: data.user.id, name: data.user.user_metadata?.name || data.user.email, email: data.user.email, role, avatar: data.user.user_metadata?.avatar_url });
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Brand Logo */}
        <div className="inline-flex  text-white p-3 rounded-2xl shadow-lg">
          {/* <Shirt  /> */}
          <img className="w-[100px] h-[100px]" src={loginLogo} alt="" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gentro Admin Panel</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Please sign in to access the control panel</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-150 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gentro.com"
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <Eye className="w-5 h-5" />  : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>

          <p className="mt-6 pt-5 border-t border-gray-150 text-xs text-gray-400 text-center">Use your Supabase Authentication admin account.</p>

        </div>
      </div>
    </div>
  );
}
