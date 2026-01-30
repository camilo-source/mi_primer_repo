/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Dopaministic colors
        emerald: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        purple: {
          DEFAULT: '#8b5cf6',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a78bfa',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        amber: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "liquid-morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(16, 185, 129, 0.6), 0 0 80px rgba(16, 185, 129, 0.3)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "border-flow": {
          "0%, 100%": { borderColor: "#10b981" },
          "33%": { borderColor: "#8b5cf6" },
          "66%": { borderColor: "#f59e0b" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "spotlight": {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "liquid-morph": "liquid-morph 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "border-flow": "border-flow 3s linear infinite",
        "scale-in": "scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-up": "slide-up 0.5s ease-out",
        "ripple": "ripple 0.6s ease-out",
        "spotlight": "spotlight 2s ease .75s 1 forwards",
        // Apple-style animations
        "apple-fade-in": "apple-fade-in 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
        "apple-scale-in": "apple-scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "apple-slide-up": "apple-slide-up 0.5s cubic-bezier(0.0, 0.0, 0.2, 1)",
        "apple-slide-down": "apple-slide-down 0.5s cubic-bezier(0.0, 0.0, 0.2, 1)",
        "apple-slide-left": "apple-slide-left 0.5s cubic-bezier(0.0, 0.0, 0.2, 1)",
        "apple-slide-right": "apple-slide-right 0.5s cubic-bezier(0.0, 0.0, 0.2, 1)",
        "apple-bounce": "apple-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "apple-spring": "apple-spring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "apple-rotate-in": "apple-rotate-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "apple-blur-in": "apple-blur-in 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
        "apple-glow-pulse": "apple-glow-pulse 2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        "apple-float": "apple-float 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        "apple-shimmer": "apple-shimmer 2s linear infinite",
        "apple-spin": "apple-spin 1s linear infinite",
        "apple-ping": "apple-ping 1s cubic-bezier(0.4, 0.0, 0.2, 1) infinite",
        "apple-skeleton": "apple-skeleton 1.5s ease-in-out infinite",
        "apple-progress": "apple-progress 1.5s ease-in-out infinite",
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'apple-in': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'apple-out': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'apple-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'apple-smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
