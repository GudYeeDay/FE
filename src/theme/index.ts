import colorTokens from './colors'

export const colors = colorTokens as {
  main: { DEFAULT: string; soft: string }
  ink: { DEFAULT: string; soft: string; faint: string }
  line: string
  bg: string
  white: string
  brand: Record<10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100, string>
}
