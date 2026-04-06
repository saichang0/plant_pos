"use client";

import React, { useState, useCallback, createContext, useContext } from "react";
import { CheckCircleIcon, CancelIcon, WarningIcon } from "@/src/components/icons/page";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const styles: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    success: {
      bg: "bg-green-50",
      border: "border-green-400",
      text: "text-green-800",
      icon: <CheckCircleIcon size={20} className="text-green-500" />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-400",
      text: "text-red-800",
      icon: <CancelIcon size={20} className="text-red-500" />,
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      text: "text-yellow-800",
      icon: <WarningIcon size={20} className="text-yellow-500" />,
    },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => {
          const s = styles[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg ${s.bg} ${s.border} animate-slide-in min-w-[300px]`}
            >
              {s.icon}
              <span className={`flex-1 text-sm font-medium ${s.text}`}>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className={`${s.text} hover:opacity-70`}>
                <CancelIcon size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
