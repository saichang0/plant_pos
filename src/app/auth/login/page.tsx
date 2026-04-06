"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CloseEyeIcon, OpenEyeIcon } from '@/src/components/icons/page';
import { LoginUserInput } from '@/src/types/auth';
import { loginUser } from '@/src/services/auth';

export default function LoginPage () {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // Changed from email to identifier
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const input: LoginUserInput = { identifier, password }; // Updated to use identifier

    try {
      const response = await loginUser(input);
      if (response.status === true) { // Changed from 'true' (string) to true (boolean)
        // Store tokens in localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        // Optionally store user data
        localStorage.setItem('user', JSON.stringify(response.user));

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 relative overflow-hidden">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-[url('/images/logos/plantleave.png')] bg-cover bg-center filter"></div>
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-black/30 backdrop-blur-xs rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/images/logos/logogreen.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Welcome Text */}
          <h1 className="text-white text-2xl font-semibold text-center mb-8">
            ຍິນດີຕ້ອນຮັບ
          </h1>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">
                {error}
              </div>
            )}
            {/* Email Input */}
            <div>
              <input
                type="text" // Changed from email to text for identifier
                placeholder="ອີເມວ ຫຼື ເບີໂທ"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-transparent bg-back/30 border border-green-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="ລະຫັດຜ່ານ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-transparent border border-green-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                {showPassword ? <CloseEyeIcon size={20} /> : <OpenEyeIcon size={20} />}
              </button>
            </div>
            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2 text-white text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-green-500 outline-none"
                />
                <span>ຈື່ຂ້ອຍ</span>
              </label>
              <Link 
                href="/auth/forgotpassword" 
                className="text-white text-sm hover:text-green-400 transition-colors"
              >
                ລືມລະຫັດຜ່ານ?
              </Link>
            </div>
            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}