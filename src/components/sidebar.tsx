"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GRADIENTS } from "@/src/lib/colors";
import {
  FaShoppingCart,
  FaBox,
  FaHistory,
  FaChartBar,
  FaCog,
  FaChevronRight,
  FaTruckLoading,
  FaWarehouse,
  FaTruck,
} from "react-icons/fa";
import { TrendUpIcon } from "./icons/page";
import { usePendingOrderCount } from "@/src/features/sale/usePendingOrders";
import { usePackingDeliveryCount } from "@/src/features/delivery/usePackingCount";
import { FaOpencart } from "react-icons/fa6";
import { TbDatabaseImport } from "react-icons/tb";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { BsAlexa } from "react-icons/bs";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  /** When true, the badge pulses to draw attention. */
  badgePulse?: boolean;
  children?: SidebarItem[];
}

const baseSidebarItems: SidebarItem[] = [
  { name: "ຂາຍ", href: "/dashboard/sales", icon: FaOpencart },
  { name: "ຈັດການອໍເດີ", href: "/dashboard/order", icon: FaShoppingCart },
  // {
  //   name: "ປະຫວັດ",
  //   href: "/dashboard/history",
  //   icon: FaHistory,
  //   children: [
  //     {
  //       name: "ປະຫວັດການຂາຍ",
  //       href: "/dashboard/history/sales",
  //       icon: TrendUpIcon,
  //     },
  //     {
  //       name: "ປະຫວດການແກ້ໄຂສະຕ໋ອກ",
  //       href: "/dashboard/history/stock",
  //       icon: FaWarehouse,
  //     },
  //   ],
  // },
  { name: "ລາຍງານ",
    href: "/dashboard/reports", 
    icon: FaChartBar,
      children: [
        {
          name: "ລາຍງານພາບລວວມ",
          href: "/dashboard/reports/overview",
          icon: TrendUpIcon,
        },
        {
          name: "ລາຍງານການຂາຍ",
          href: "/dashboard/reports/sales",
          icon: BsAlexa,
        },
          {
          name: "ລາຍງານການສັ່ງຊື້/ນຳເຂົ້າ",
          href: "/dashboard/reports/purchases",
          icon: BiSolidPurchaseTag,
        },
      ],
  },
  { name: "ສັ່ງຊື້", href: "/dashboard/import", icon: FaTruckLoading },
  { name: "ຈັດການສະຕ໋ອກ", href: "/dashboard/stock", icon: FaWarehouse },
  { name: "ສີນຄ້າຄົງຄັງ", href: "/dashboard/inventory", icon: FaBox },
  { name: "ຈັດສົ່ງ", href: "/dashboard/delivery-tracking", icon: FaTruck },
  { name: "ຕັ້ງຄ່າ", href: "/dashboard/setting", icon: FaCog },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  isCollapsed: propCollapsed,
  setIsCollapsed: propSetIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoverTop, setHoverTop] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState(propCollapsed || false);

  // Live count of pending orders from the mobile app.
  const { count: pendingFromApp, didIncrease } = usePendingOrderCount();
  // Live count of confirmed orders waiting to be shipped (delivery in PACKING).
  const { count: packingCount, didIncrease: packingIncrease } =
    usePackingDeliveryCount();

  // Decorate the base list with the dynamic badges.
  const sidebarItems: SidebarItem[] = baseSidebarItems.map((item) => {
    if (item.href === "/dashboard/order" && pendingFromApp > 0) {
      return { ...item, badge: pendingFromApp, badgePulse: didIncrease };
    }
    if (item.href === "/dashboard/delivery-tracking" && packingCount > 0) {
      return { ...item, badge: packingCount, badgePulse: packingIncrease };
    }
    return item;
  });

  const toggleExpanded = (itemName: string) => {
    // Single-open behaviour: opening one parent collapses any other open one.
    setExpandedItems((prev) => (prev.includes(itemName) ? [] : [itemName]));
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
      <div
        className={`
          fixed top-0 left-0 h-screen z-50
          ${GRADIENTS.sidebarBg}
          border-r border-emerald-900/30
          transform transition-all duration-300 ease-out
          lg:translate-x-0
          ${isCollapsed ? "w-20" : "w-72"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-slate-700/40 flex-shrink-0">
          <button
            onClick={handleCollapseToggle}
            className="relative mt-2 w-full cursor-pointer group"
            title={isCollapsed ? "ຂະຫຍາຍ" : "ຫຍໍ້"}
          >
            {isCollapsed ? (
              <div className="w-12 h-12 bg-[url('/images/logos/logowhite.png')] bg-cover bg-center rounded-lg transition-transform group-hover:scale-110" />
            ) : (
              <div className="w-32 h-12 bg-[url('/images/logos/logowhitetl.png')] bg-cover bg-center rounded-lg transition-transform group-hover:scale-105" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {sidebarItems.map((item) => {
            const hasChildren = !!item.children?.length;
            const isExpanded = expandedItems.includes(item.name);
            const isActive = pathname === item.href;
            const isChildActive = hasChildren
              ? item.children!.some(
                  (c) =>
                    pathname === c.href ||
                    pathname.startsWith(c.href + "/"),
                )
              : false;
            const showAsActive = isActive || isChildActive;
            const Icon =
              showAsActive && item.activeIcon ? item.activeIcon : item.icon;

            // Row classes — uses :active for press feedback,
            // gradient background that fades in on hover/active.
            const rowClasses = `
              group relative flex items-center
              ${isCollapsed ? "justify-center" : "justify-between"}
              px-3 py-2.5 rounded-xl
              w-full text-left
              transition-all duration-200 ease-out
              active:scale-[0.97]
              ${
                showAsActive
                  ? "bg-gradient-to-r from-emerald-500/25 to-emerald-400/10 text-white shadow-lg shadow-emerald-500/10"
                  : "text-slate-300 hover:bg-slate-700/40 hover:text-white hover:translate-x-1"
              }
            `;

            const rowInner = (
              <>
                {/* Left accent — slides in on hover/active */}
                <span
                  className={`
                    absolute left-0 top-1/2 -translate-y-1/2
                    w-1 rounded-r-full
                    bg-gradient-to-b from-emerald-400 to-emerald-600
                    transition-all duration-300 ease-out
                    ${showAsActive ? "h-8 opacity-100" : "h-0 opacity-0 group-hover:h-6 group-hover:opacity-60"}
                  `}
                />

                <div
                  className={`flex items-center ${isCollapsed ? "" : "space-x-3"}`}
                >
                  {/* Icon chip */}
                  <div
                    className={`
                      relative flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-200 ease-out
                      ${
                        showAsActive
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/40"
                          : "bg-slate-700/60 text-slate-400 group-hover:bg-slate-600 group-hover:text-white group-hover:scale-110"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {showAsActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                    )}
                    {showAsActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                    {/* Badge dot for the collapsed sidebar — shown when this
                        item has a numeric badge (e.g. pending orders). */}
                    {isCollapsed && item.badge !== undefined && item.badge !== null && (
                      <>
                        {item.badgePulse && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-400/60 animate-ping" />
                        )}
                        <span
                          className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-slate-900 ${
                            item.badgePulse ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </>
                    )}
                  </div>

                  {!isCollapsed && (
                    <span
                      className={`text-sm font-medium tracking-wide transition-colors ${
                        showAsActive
                          ? "text-white"
                          : "text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center space-x-2">
                    {item.badge !== undefined && item.badge !== null && (
                      <span className="relative inline-flex items-center">
                        {item.badgePulse && (
                          <span className="absolute inset-0 rounded-full bg-rose-400/60 animate-ping" />
                        )}
                        <span
                          className={`
                            relative px-2 py-0.5 text-[10px] font-bold rounded-full min-w-[20px] text-center
                            ${
                              item.badgePulse
                                ? "bg-rose-500 text-white ring-2 ring-rose-300/50"
                                : showAsActive
                                  ? "bg-emerald-500 text-white ring-1 ring-emerald-300/40"
                                  : "bg-emerald-500/90 text-white"
                            }
                          `}
                        >
                          {item.badge}
                        </span>
                      </span>
                    )}
                    {hasChildren ? (
                      <FaChevronRight
                        className={`w-3.5 h-3.5 transition-all duration-300 ${
                          isExpanded ? "rotate-90" : ""
                        } ${
                          showAsActive
                            ? "text-emerald-300"
                            : "text-slate-500 group-hover:text-white"
                        }`}
                      />
                    ) : (
                      showAsActive && (
                        <FaChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                      )
                    )}
                  </div>
                )}
              </>
            );

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <div
                    className="relative"
                    onMouseEnter={(e) => {
                      if (!isCollapsed) return;
                      const rect = (
                        e.currentTarget as HTMLElement
                      ).getBoundingClientRect();
                      setHoverTop(rect.top);
                      setHoveredItem(item.name);
                    }}
                    onMouseLeave={() => isCollapsed && setHoveredItem(null)}
                  >
                    <button
                      type="button"
                      className={rowClasses}
                      onClick={() => {
                        if (!isCollapsed) toggleExpanded(item.name);
                      }}
                      title={isCollapsed ? item.name : ""}
                    >
                      {rowInner}
                    </button>

                    {/* Flyout for collapsed sidebar */}
                    {isCollapsed && hoveredItem === item.name && (
                      <div
                        className="
                          fixed z-[100]
                          min-w-[240px] rounded-2xl
                          border border-slate-700/60
                          bg-slate-900/95 backdrop-blur-md
                          shadow-2xl shadow-black/40
                          p-2
                          animate-in fade-in slide-in-from-left-2 duration-150
                        "
                        style={{ top: hoverTop, left: 80 }}
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300/80 border-b border-slate-700/60 mb-1">
                          {item.name}
                        </div>
                        <div className="space-y-0.5">
                          {item.children!.map((child) => {
                            const childActive =
                              pathname === child.href ||
                              pathname.startsWith(child.href + "/");
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                  group/child flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm
                                  transition-all duration-150 active:scale-[0.97]
                                  ${
                                    childActive
                                      ? "bg-emerald-500/20 text-emerald-200"
                                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white hover:translate-x-0.5"
                                  }
                                `}
                              >
                                <ChildIcon
                                  className={`w-4 h-4 transition-transform group-hover/child:scale-110 ${
                                    childActive
                                      ? "text-emerald-300"
                                      : "text-slate-400"
                                  }`}
                                />
                                <span className="font-medium">{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={rowClasses}
                    onClick={() => {
                      setIsOpen(false);
                      // Clicking a non-dropdown item collapses any
                      // currently-open children group.
                      setExpandedItems([]);
                    }}
                    title={isCollapsed ? item.name : ""}
                  >
                    {rowInner}
                  </Link>
                )}

                {/* Inline children (expanded sidebar) */}
                {hasChildren && !isCollapsed && (
                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-out
                      ${isExpanded ? "max-h-96 mt-1" : "max-h-0"}
                    `}
                  >
                    <div className="ml-6 space-y-0.5 border-l border-slate-700/40 pl-3 py-1">
                      {item.children!.map((child) => {
                        const childActive =
                          pathname === child.href ||
                          pathname.startsWith(child.href + "/");
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => setIsOpen(false)}
                            className={`
                              group/child relative flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm
                              transition-all duration-200 active:scale-[0.97]
                              ${
                                childActive
                                  ? "bg-emerald-500/15 text-emerald-200"
                                  : "text-slate-400 hover:bg-slate-700/40 hover:text-white hover:translate-x-1"
                              }
                            `}
                          >
                            {childActive && (
                              <span className="absolute -left-[15px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                            )}
                            <ChildIcon
                              className={`w-3.5 h-3.5 transition-transform group-hover/child:scale-110 ${
                                childActive ? "text-emerald-300" : "text-slate-500"
                              }`}
                            />
                            <span className="font-medium">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
