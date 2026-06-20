/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 背景色 — 通过 CSS 变量支持主题切换
        "bg-deepest": "var(--bg-deepest)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-main": "var(--bg-main)",
        "bg-card": "var(--bg-card)",
        "bg-input": "var(--bg-input)",
        "bg-hover": "var(--bg-hover)",
        "bg-active": "var(--bg-active)",

        // 文字色
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "text-muted": "var(--text-muted)",
        "text-link": "var(--text-link)",

        // 强调色 — 暖琥珀金
        accent: "#b8860b",
        "accent-hover": "#d4a017",
        "accent-dark": "#9a7209",
        cyan: "#5b8a72",
        danger: "#c0392b",
        success: "#27ae60",

        // 边框
        "border-default": "var(--border-default)",
        "border-card": "var(--border-card)",
        "border-input": "var(--border-input)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
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
