"use client";

import Sidebar from '@/src/components/sidebar';
import { ToastProvider } from '@/src/components/toast';
import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaUser, FaSignOutAlt } from "react-icons/fa";
import { IoIosSearch } from 'react-icons/io';
import { NotiIcon } from '@/src/components/icons/page';
import { GoPlus } from 'react-icons/go';
import { MdOutlinePersonalInjury } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { GRADIENTS } from '@/src/lib/colors';
import { useCurrentUser } from '@/src/features/user/useUser';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/auth/login');
  };

  return (
    <ToastProvider>
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main content */}
      <div className={`ml-0 min-h-screen overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
        {/* Top header */}
        <header className={`fixed top-0 right-0 z-40 bg-white border-b border-slate-700/50 transition-all duration-300 ${isSidebarCollapsed ? 'lg:left-20' : 'lg:left-72'} left-0`}>
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-between w-full">
              {/* Shop name + Search bar */}
              <div className="flex items-center gap-6">
                {currentUser?.shopName && (
                  <h1 className="hidden md:block text-xl font-bold text-slate-800 truncate max-w-xs">
                    {currentUser.shopName}
                  </h1>
                )}
                <div className="hidden md:block">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາ..."
                      className="w-64 px-4 py-2 pl-10 bg-white border border-slate-600/50 rounded-xl text-slate-600 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                    />
                    <IoIosSearch className="absolute left-3 top-2.5 w-5 h-5 text-slate-600" />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center space-x-4 w-50% justify-around">
                <button
                onClick={() => router.push('/dashboard/addPlant')}
                 className={`flex items-center justify-center ${GRADIENTS.sidebarBg} space-x-2 text-slate-100 transition-colors px-3 py-2 rounded-[50px]`}>
                  <GoPlus className='font-bold w-5 h-5' />
                  <span>Add new plant</span>
                </button>
                <button className="relative p-2 text-slate-800 transition-colors">
                  <NotiIcon className="w-7 h-7 font-bold" />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-yellow-600 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    2
                  </span>
                </button>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="text-slate-800 hover:text-slate-600 transition-colors"
                  >
                    <MdOutlinePersonalInjury className='w-7 h-7 font-bold' />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          router.push('/dashboard/setting/user');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FaUser className="w-4 h-4 text-gray-500" />
                        ເບິ່ງໂປຣຟາຍ
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        ອອກຈາກລະບົບ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 pb-4 pt-[88px] sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
