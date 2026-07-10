/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#050d1a',
          800: '#081525',
          700: '#0c1e33',
        },
        sky: {
          brand: '#38bdf8',
        },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
        'gradient-cyan':    'linear-gradient(135deg, #22d3ee 0%, #38bdf8 100%)',
        'gradient-success': 'linear-gradient(135deg, #34d399 0%, #22d3ee 100%)',
        'gradient-danger':  'linear-gradient(135deg, #f87171 0%, #fb923c 100%)',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both',
        'scale-in':  'scaleIn 0.35s cubic-bezier(0.4,0,0.2,1) both',
        'slide-r':   'slideRight 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'spin-slow': 'spin 3s linear infinite',
        'float':     'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:     { '0%': { opacity:'0', transform:'translateY(16px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        scaleIn:    { '0%': { opacity:'0', transform:'scale(0.95)' },      '100%': { opacity:'1', transform:'scale(1)' } },
        slideRight: { '0%': { opacity:'0', transform:'translateX(-16px)' },'100%': { opacity:'1', transform:'translateX(0)' } },
        float:      { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
      },
      fontFamily: {
        sans:     ['Inter', 'system-ui', 'sans-serif'],
        heading:  ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sky':    '0 0 24px rgba(56,189,248,0.45), 0 0 48px rgba(56,189,248,0.18)',
        'glow-purple': '0 0 24px rgba(129,140,248,0.4), 0 0 48px rgba(129,140,248,0.15)',
        'glow-green':  '0 0 24px rgba(52,211,153,0.4),  0 0 48px rgba(52,211,153,0.15)',
        'card':        '0 8px 32px rgba(0,0,0,0.5)',
        'card-hover':  '0 0 0 1px rgba(56,189,248,0.1), 0 16px 48px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
