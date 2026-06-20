/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 背景色 — 极浅奶油色调
        "bg-deepest": "#f0ebe5",
        "bg-sidebar": "#f7f4f0",
        "bg-main": "#faf8f5",
        "bg-card": "#ffffff",
        "bg-input": "#f5f2ee",
        "bg-hover": "#ece7e1",
        "bg-active": "#e3ddd5",

        // 文字色
        "text-primary": "#1a1816",
        "text-secondary": "#4a4540",
        "text-tertiary": "#8a8279",
        "text-muted": "#b5ada5",
        "text-link": "#7c6a56",

        // 强调色 — 暖琥珀金
        accent: "#b8860b",
        "accent-hover": "#d4a017",
        "accent-dark": "#9a7209",
        cyan: "#5b8a72",
        danger: "#c0392b",
        success: "#27ae60",

        // 边框
        "border-default": "#e5e0da",
        "border-card": "#ddd8d2",
        "border-input": "#d5d0ca",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(26,24,22,0.04)",
        md: "0 4px 16px rgba(26,24,22,0.06)",
        lg: "0 8px 32px rgba(26,24,22,0.08)",
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
