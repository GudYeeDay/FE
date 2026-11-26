// Figma "컬러 정리" 기준 디자인 토큰. tailwind.config.js 와 TS 코드(SVG color 등)에서 함께 쓴다.
module.exports = {
  main: { DEFAULT: '#C80408', soft: '#F11A1E' },
  ink: { DEFAULT: '#1C1C1A', soft: '#918C80', faint: '#B9B4A6' },
  line: '#E7E7E7',
  bg: '#FAFAFA',
  // 홈 이번 주 띠의 빈 칸 배경·글자 (Figma Field/Card)
  empty: { DEFAULT: '#F1F1F1', text: '#D7D7D7' },
  white: '#FFFFFF',
  brand: {
    10: '#FFECED',
    20: '#FFCBCC',
    30: '#FFA9AB',
    40: '#FF888A',
    50: '#FF6669',
    60: '#F54245',
    70: '#CC2528',
    80: '#A30F12',
    90: '#7A0003',
    100: '#510002',
  },
}
