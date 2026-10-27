import { Pressable, Text, View } from 'react-native'

import { FormScreen } from '@/components/auth/FormScreen'
import { useProfile, type NotificationSettings } from '@/features/my/profile'

const ROWS: {
  key: keyof NotificationSettings
  label: string
  caption?: string
}[] = [
  { key: 'all', label: '전체 알림' },
  { key: 'today', label: '오늘의 굳이', caption: '당일 기록이 없으면 저녁에 알려드려요' },
  { key: 'remind', label: '미션 리마인드', caption: '시작 후 4시간 안에 기록이 없으면 알려드려요' },
  { key: 'feed', label: '서비스 업데이트 알림', caption: '새로운 기능과 공지를 알려드려요' },
]

export function NotificationScreen() {
  const { notifications, setNotifications } = useProfile()

  return (
    <FormScreen title="알림 설정">
      {ROWS.map((row, index) => (
        <View
          key={row.key}
          className={index === 0 ? 'flex-row items-center' : 'mt-6 flex-row items-center'}
        >
          <View className="mr-4 min-w-0 flex-1">
            <Text className="font-ko text-ko-16 text-ink">{row.label}</Text>
            {row.caption ? (
              <Text className="mt-1 font-ko text-ko-12 text-ink-soft">{row.caption}</Text>
            ) : null}
          </View>
          <Toggle
            label={row.label}
            value={notifications[row.key]}
            onValueChange={(value) => setNotifications({ [row.key]: value })}
          />
        </View>
      ))}
    </FormScreen>
  )
}

function Toggle({
  label,
  value,
  onValueChange,
}: {
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      className={`h-7 w-12 justify-center rounded-full px-0.5 ${value ? 'bg-main' : 'bg-line'}`}
    >
      <View className={`h-6 w-6 rounded-full bg-white ${value ? 'self-end' : 'self-start'}`} />
    </Pressable>
  )
}
