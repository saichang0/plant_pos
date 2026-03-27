"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CloseEyeIcon, OpenEyeIcon } from '@/src/components/icons/page';

export default function LoginPage () {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle login logic here
    console.log('Login:', { email, password, rememberMe });
    
    // For demo purposes, redirect to dashboard after successful login
    // In a real app, you would validate credentials with your backend
    router.push('/dashboard');
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
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="ອີເມວ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-transparent bg-back/30 border border-green-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
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
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              ເຂົ້າສູ່ລະບົບ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}