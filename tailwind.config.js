const colors = require('./src/theme/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors,
      // RN 에서는 커스텀 폰트에 fontWeight 가 먹지 않으므로 굵기별로 family 를 나눈다.
      fontFamily: {
        ko: ['NotoSansKR_400Regular'],
        'ko-medium': ['NotoSansKR_500Medium'],
        'ko-bold': ['NotoSansKR_700Bold'],
        en: ['Inter_400Regular'],
        'en-medium': ['Inter_500Medium'],
      },
      // Figma 텍스트 스타일: ko 12 / ko 14 / ko 16 / ko header / ko 14 inter / ko 16 inter / en cap
      fontSize: {
        'ko-12': ['12px', { lineHeight: '17.6px', letterSpacing: '-0.344px' }],
        'ko-14': ['14px', { lineHeight: '17.6px', letterSpacing: '-0.344px' }],
        'ko-16': ['16px', { lineHeight: '24px', letterSpacing: '-0.6px' }],
        'ko-20': ['20px', { lineHeight: '34px', letterSpacing: '0.38px' }],
        'en-12': ['12px', { lineHeight: '15px' }],
        'en-14': ['14px', { lineHeight: '17px' }],
        'en-16': ['16px', { lineHeight: '28px', letterSpacing: '0.38px' }],
      },
    },
  },
  plugins: [],
}
