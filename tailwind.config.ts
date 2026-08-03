import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Colores del Design System de UDONET
      colors: {
        // 🟦 Azules
        'main-blue': '#5D9CFC',
        'dark-main-blue': '#1E3B70',
        'regular-blue': '#4181E0',
        'link-color': '#6ABAF4',

        // 🟧 Naranjas y Amarillos
        'deep-orange': '#D13B00',
        'main-orange': '#FF6600',
        'fruit-orange': '#FF8800',
        'main-yellow': '#FFFF00',

        // ⬛ Negros, Grises y Blancos
        'main-black': '#0C0C0C',
        'lite-black': '#303030',
        'gray-custom': '#505050',
        'alpha-black': 'rgba(12, 12, 12, 0.4)',
        'white-gray': '#D9D9D9',
        'gray-blue': '#D9E3F2',
        'lite-white': '#EEEEEE',
        'pure-white': '#FFFFFF',
      },

      // 🔤 Tipografías (Candal para todo en general, Open Sans para Tags)
      fontFamily: {
        candal: ['Candal', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },

      // 📏 Escala de Tamaños de Fuente
      fontSize: {
        'h1': ['36px', { lineHeight: '1.2' }],
        'h2': ['32px', { lineHeight: '1.25' }],
        'h3': ['28px', { lineHeight: '1.3' }],
        'h4': ['24px', { lineHeight: '1.35' }],
        'h5': ['20px', { lineHeight: '1.4' }],
        'p-plus': ['18px', { lineHeight: '1.5' }],
        'p': ['16px', { lineHeight: '1.5' }],
        'tiny': ['14px', { lineHeight: '1.4' }],
        'extra-tiny': ['10px', { lineHeight: '1.4' }],
      }
    },
  },
  plugins: [],
}

export default config