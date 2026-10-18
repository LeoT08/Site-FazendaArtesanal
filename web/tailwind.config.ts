import type { Config } from 'tailwindcss'

// Paleta tirada dos próprios produtos: o branco da porcelana, o verde do tomilho e da sálvia,
// o rosa da beterraba (caramelle, cebolas em rosa) e o amarelo do açafrão.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        porcelana: '#FDFDFB',
        tomilho: { DEFAULT: '#26302A', soft: '#3A463F' },
        salvia: { DEFAULT: '#6B7C6F', light: '#A9B6AA', wash: '#EEF1EC' },
        beterraba: { DEFAULT: '#A8325A', dark: '#8A2649', wash: '#F7E8EE' },
        acafrao: { DEFAULT: '#E3A92F', wash: '#FBF1D9' },
        massa: '#F4EAD3',
        linha: '#E2E6DF',
      },
      fontFamily: {
        display: ['"Young Serif"', 'Georgia', 'serif'],
        sans: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // escala modular 1.25 a partir de 16px
        'display-xl': ['clamp(2.625rem, 4.4vw + 0.75rem, 4.75rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 3vw + 1rem, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.5rem, 1.5vw + 1rem, 2.125rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        plate: '999px',
      },
      maxWidth: {
        prose: '62ch',
      },
    },
  },
  plugins: [],
} satisfies Config
