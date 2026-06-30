/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
        },
        surface: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b',
          900: '#0f172a', 950: '#020617',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow':  '0 0 24px rgba(14,165,233,0.35)',
      },
      animation: {
        'slide-up': 'slideUp 0.22s ease-out',
        'fade-in':  'fadeIn 0.18s ease-out',
        'scan-line':'scanLine 1.8s ease-in-out infinite',
        'ai-pulse': 'aiPulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp:  { from: { opacity:'0', transform:'translateY(18px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:   { from: { opacity:'0' }, to: { opacity:'1' } },
        scanLine: { '0%,100%': { top:'15%' }, '50%': { top:'80%' } },
        aiPulse:  { '0%,100%': { opacity:'0.3', transform:'scale(1)' }, '50%': { opacity:'0.8', transform:'scale(1.1)' } },
      },
    },
  },
  plugins: [],
}
