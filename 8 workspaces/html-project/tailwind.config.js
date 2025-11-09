export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        demon: { red: '#ff0000', dark: '#1a1a1a', glass: 'rgba(255,0,0,0.1)' }
      },
      animation: {
        'liquid': 'liquid 8s ease-in-out infinite',
        'hover-force': 'hover-force 0.3s ease-out'
      },
      keyframes: {
        liquid: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }
        },
        'hover-force': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1.05)' }
        }
      }
    }
  },
  plugins: []
}