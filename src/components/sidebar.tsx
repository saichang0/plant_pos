"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome,
  FaShoppingCart,
  FaBox,
  FaHistory,
  FaCreditCard,
  FaChartBar,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronRight
} from "react-icons/fa";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'ໜ້າຫຼັກ',
    href: '/dashboard',
    icon: FaHome,
    activeIcon: FaHome,
  },
  {
    name: 'ຈັດການອໍເດີ',
    href: '/dashboard/order',
    icon: FaShoppingCart,
  },
  {
    name: 'ລາຍງານ',
    href: '/dashboard/reports',
    icon: FaChartBar,
  },
  // {
  //   name: 'ລາຍການສັ່ງຊື້',
  //   href: '/dashboard/manage-data',
  //   icon: FaUsers,
  // },
  {
    name: 'ລາຍການສັ່ງຊື້',
    href: '/dashboard/import',
    icon: FaBox,
  },
  // {
  //   name: 'ຂາຍ',
  //   href: '/dashboard/sales',
  //   icon: FaCreditCard,
  // },
  {
    name: 'ຈັດການສະຕ໋ອກ',
    href: '/dashboard/stock',
    icon: FaBox,
  },
  {
    name: 'ສີນຄ້າຄົງຄັງ',
    href: '/dashboard/inventory',
    icon: FaBox,
  },
  // {
  //   name: 'ລູກຄ້າ',
  //   href: '/dashboard/customers',
  //   icon: FaUsers,
  // },
  {
    name: 'ຕິດຕາມການສົ່ງ',
    href: '/dashboard/delivery-tracking',
    icon: FaHistory,
  },
  {
    name: 'ຕັ້ງຄ່າ',
    href: '/dashboard/setting',
    icon: FaCog,
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed: propCollapsed, setIsCollapsed: propSetIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(propCollapsed || false);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    propSetIsCollapsed?.(newCollapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen z-50 
        bg-gradient-to-b from-[#06221A] via-[#041a14] to-[#06221A]
        border-r border-emerald-900/30 transform transition-all duration-300 ease-in-out
        lg:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-slate-700/50 flex-shrink-0 relative flex-row justify-between">
          {/* Logo - always visible */}
          <button
            onClick={handleCollapseToggle}
            className="relative mt-2 w-full cursor-pointer">
            {isCollapsed ? (
              <div className="w-12 h-12 bg-[url('/images/logos/logowhite.png')] bg-cover bg-center rounded-lg"></div>
            ) : (
              <div className="w-32 h-12 bg-[url('/images/logos/logowhitetl.png')] bg-cover bg-center rounded-lg"></div>
            )}
          </button>

          {/* Collapse toggle button - only on desktop */}
          {/* <button
            onClick={handleCollapseToggle}
            className="hidden lg:flex absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
          >
            {isCollapsed ? (
              <FaChevronRight className="w-4 h-4" />
            ) : (
              <FaTimes className="w-4 h-4" />
            )}
          </button> */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-3 rounded-xl
                  transition-all duration-200 ease-in-out
                  ${isActive
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 shadow-lg shadow-green-500/10'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.name : ''}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                  <div className={`
                    relative p-2 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                      : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-600 group-hover:text-white'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 opacity-20 animate-pulse" />
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className={`font-medium ${isActive ? 'text-green-400' : 'text-slate-300'}`}>
                      {item.name}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`
                        px-2 py-1 text-xs font-semibold rounded-full
                        ${isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-600/50 text-slate-300 border border-slate-600'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <FaChevronRight className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700/50 flex-shrink-0">
          <div className="text-center">
            <p className="text-slate-500 text-xs">Version 2026.1.0</p>
            <p className="text-slate-600 text-xs mt-1">© Plant POS Systems</p>
          </div>
        </div>
      </div>
    </>
  );
}
