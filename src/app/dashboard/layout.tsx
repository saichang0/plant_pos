"use client";

import Sidebar from '@/src/components/sidebar';
import { ToastProvider } from '@/src/components/toast';
import React, { useState } from 'react';
import { FaBars } from "react-icons/fa";
import { IoIosSearch } from 'react-icons/io';
import { NotiIcon } from '@/src/components/icons/page';
import { GoPlus } from 'react-icons/go';
import { IoPersonCircleSharp } from 'react-icons/io5';
import { MdOutlinePersonalInjury } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { GRADIENTS } from '@/src/lib/colors';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

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
              {/* Search bar */}
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
                <button>
                  <MdOutlinePersonalInjury className='w-7 h-7 font-bold' />
                </button>
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
