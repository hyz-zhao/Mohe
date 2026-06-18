/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 背景色
        "bg-deepest": "#0a0e17",
        "bg-sidebar": "#0f1520",
        "bg-main": "#111827",
        "bg-card": "#1a2332",
        "bg-input": "#1e293b",
        "bg-hover": "#1e2d42",
        "bg-active": "#1a3a5c",

        // 文字色
        "text-primary": "#f1f5f9",
        "text-secondary": "#cbd5e1",
        "text-tertiary": "#94a3b8",
        "text-muted": "#64748b",
        "text-link": "#60a5fa",

        // 强调色
        accent: "#3b82f6",
        "accent-hover": "#60a5fa",
        "accent-dark": "#2563eb",
        cyan: "#06b6d4",
        danger: "#ef4444",
        success: "#10b981",

        // 边框
        "border-default": "#1e293b",
        "border-card": "#253347",
        "border-input": "#334155",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.3)",
        md: "0 4px 12px rgba(0,0,0,0.4)",
        lg: "0 8px 24px rgba(0,0,0,0.5)",
      },
      fontSize: {
        xs: "11px",
        sm: "13px",
        base: "15px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
      },
    },
  },
  plugins: [],
};
