// ============================================
// Centralized Color Constants for Plant POS
// Import: import { COLORS } from '@/src/lib/colors'
// ============================================

export const COLORS = {
  // --- Primary (Green) ---
  primary: "#22c55e",
  primaryHover: "#16a34a",
  primarySoft: "rgba(34,197,94,0.4)",
  primarySoft08: "rgba(34,197,94,0.08)",
  primarySoft15: "rgba(34,197,94,0.15)",
  primaryGlow: "rgba(34,197,94,0.3)",
  primaryGradientStart: "#16a34a",
  primaryGradientEnd: "#22c55e",

  // --- Dark Forest Green (Sidebar & Buttons) ---
  forest: "#06221A",
  forestMid: "#041a14",
  forestButton: "#062d24",

  // --- Background ---
  backgroundStart: "#1e1e22",
  backgroundEnd: "#1a1a1e",
  backgroundLight: "#f8fafc",

  // --- Border & Shadow ---
  border: "rgba(255,255,255,0.06)",
  shadow: "rgba(0,0,0,0.6)",
  shadowInset: "rgba(255,255,255,0.03)",

  // --- Text ---
  text: "#f1f1f3",
  textMuted: "#c4c4cc",
  textSecondary: "#6b6b78",
  textDark: "#111827",
} as const;

// Tailwind arbitrary value helpers — use in className like `bg-[${TW.forest}]`
export const TW = COLORS;

// Pre-built gradient class strings for reuse
// NOTE: Must use literal strings (not template literals) so Tailwind JIT can detect them
export const GRADIENTS = {
  sidebar: "from-[#06221A] via-[#041a14] to-[#06221A]",
  sidebarBg: "bg-gradient-to-b from-[#06221A] via-[#041a14] to-[#06221A]",
} as const;
