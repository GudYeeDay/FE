/** 조건부 className 합치기. falsy 값은 버린다. */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
