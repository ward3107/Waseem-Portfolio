import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#483AA0',
          purpleLight: '#7965C1',
          // Dark-mode text shade. purpleLight (#7965C1) only reaches ~3.8:1 on
          // the dark hero background — the emphasized headline word read as
          // invisible at night. This lighter tint clears AA for large text
          // (~6.5:1) while staying unmistakably purple.
          purpleLighter: '#A78BFA',
          purpleDark: '#2e246b',
          gold: '#d4af37',
          goldLight: '#E3D095',
          cyan: '#00E5FF',
          blue: '#3B82F6',
          green: '#10B981',
          orange: '#FF6B35',
          teal: '#14B8A6',
          pink: '#EC4899',
        }
      },
      fontFamily: {
        // Inter/Space Grotesk cover Latin; Heebo (Hebrew) and Cairo (Arabic)
        // are per-glyph fallbacks so RTL text renders in a real webfont instead
        // of an arbitrary system font. See the @font-face rules in index.css.
        sans: ['Inter', 'Heebo', 'Cairo', 'sans-serif'],
        heading: ['Space Grotesk', 'Heebo', 'Cairo', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [
    // Provides the `prose` utility used by /privacy and /accessibility for
    // legal-document typography. Small footprint — only pages that opt in
    // via `className="prose"` ship the styles.
    typography,
  ],
}