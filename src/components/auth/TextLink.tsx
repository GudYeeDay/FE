import { Pressable, Text } from 'react-native'

/** 밑줄 텍스트 링크 (Figma: 회원가입 / 비밀번호 찾기) */
export function TextLink({ children, onPress }: { children: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={onPress}>
      <Text className="font-en text-en-14 text-ink underline">{children}</Text>
    </Pressable>
  )
}
