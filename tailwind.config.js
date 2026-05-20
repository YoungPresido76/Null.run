/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Neon Verse brand colours ────────────────────────────────
      colors: {
        // shadcn token pass-through
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },

        // ── Neon Verse custom palette ────────────────────────────
        neon: {
          cyan:    "#00f3ff",
          magenta: "#ff00aa",
          purple:  "#9d00ff",
          green:   "#00ff88",
        },
        void: {
          bg:        "#020614",   // deepest background
          surface:   "#040d1e",   // panel background
          elevated:  "#071428",   // elevated card bg
          border:    "rgba(0,243,255,0.12)",
        },
      },

      // ── Fonts ────────────────────────────────────────────────────
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
        mono:     ["Share Tech Mono", "monospace"],
      },

      // ── Border radius ─────────────────────────────────────────────
      borderRadius: {
        xl:  "calc(var(--radius) + 4px)",
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xs:  "calc(var(--radius) - 6px)",
      },

      // ── Box shadows ───────────────────────────────────────────────
      boxShadow: {
        xs:           "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "neon-cyan":    "0 0 12px rgba(0,243,255,0.5), inset 0 0 12px rgba(0,243,255,0.08)",
        "neon-magenta": "0 0 12px rgba(255,0,170,0.5), inset 0 0 12px rgba(255,0,170,0.08)",
        "neon-purple":  "0 0 12px rgba(157,0,255,0.5), inset 0 0 12px rgba(157,0,255,0.08)",
      },

      // ── Animations ────────────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%":     { opacity: "0" },
        },
        spinRing: { to: { transform: "rotate(360deg)" } },
        radarSweep: { to: { transform: "rotate(360deg)" } },
        sweep: {
          "0%":   { left: "-60%" },
          "100%": { left: "140%" },
        },
        particleFly: {
          "0%":   { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translate(var(--tx),var(--ty)) scale(0) rotate(180deg)", opacity: "0" },
        },
        floatUp: {
          "0%":   { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-60px)", opacity: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "caret-blink":    "caret-blink 1.25s ease-out infinite",
        "spin-ring":      "spinRing 6s linear infinite",
        "spin-ring-slow": "spinRing 10s linear infinite reverse",
        "spin-ring-xs":   "spinRing 16s linear infinite",
        "radar-sweep":    "radarSweep 3s linear infinite",
        "hud-sweep":      "sweep 8s linear infinite",
        "particle-fly":   "particleFly 0.8s ease-out forwards",
        "float-up":       "floatUp 1s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
