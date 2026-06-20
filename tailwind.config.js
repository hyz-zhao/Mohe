/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 背景色 — 暖纸色调，层次分明
        "bg-deepest": "#f5f0eb",
        "bg-sidebar": "#faf7f4",
        "bg-main": "#fffdf9",
        "bg-card": "#ffffff",
        "bg-input": "#f8f5f1",
        "bg-hover": "#f0ebe5",
        "bg-active": "#e8e0d6",

        // 文字色 — 深炭灰，柔和不刺眼
        "text-primary": "#2c2825",
        "text-secondary": "#5a534d",
        "text-tertiary": "#8a8279",
        "text-muted": "#b0a89e",
        "text-link": "#7c6a56",

        // 强调色 — 暖琥珀金
        accent: "#b8860b",
        "accent-hover": "#d4a017",
        "accent-dark": "#9a7209",
        cyan: "#5b8a72",
        danger: "#c0392b",
        success: "#27ae60",

        // 边框 — 极淡的暖灰
        "border-default": "#e8e2db",
        "border-card": "#ddd6cd",
        "border-input": "#d5cdc4",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(44,40,37,0.06)",
        md: "0 4px 12px rgba(44,40,37,0.08)",
        lg: "0 8px 24px rgba(44,40,37,0.10)",
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
