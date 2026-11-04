import { Switch, Text, View } from 'react-native'

import { FormScreen } from '@/components/auth/FormScreen'
import { myActions, useMyProfile, type NotificationSettings } from '@/features/my/store'
import { colors } from '@/theme'

const ROWS: { key: keyof NotificationSettings; label: string; caption: string }[] = [
  { key: 'today', label: '오늘의 굳이', caption: '당일 기록이 없으면 저녁에 알려드려요' },
  { key: 'remind', label: '미션 리마인드', caption: '미션 시작 후 기록이 없으면 알려드려요' },
  { key: 'update', label: '서비스 업데이트 알림', caption: '새로운 기능과 공지를 알려드려요' },
]

/** Figma: 알림 설정. 전체 알림은 아래 항목을 한 번에 켜고 끈다 */
export default function NotificationSettingScreen() {
  const { notifications } = useMyProfile()
  const allOn = ROWS.every((row) => notifications[row.key])

  return (
    <FormScreen title="알림 설정">
      <SettingRow
        label="전체 알림"
        value={allOn}
        onValueChange={(on) => myActions.setNotifications({ today: on, remind: on, update: on })}
      />
      {ROWS.map((row) => (
        <SettingRow
          key={row.key}
          label={row.label}
          caption={row.caption}
          value={notifications[row.key]}
          onValueChange={(on) => myActions.setNotifications({ [row.key]: on })}
        />
      ))}
    </FormScreen>
  )
}

function SettingRow({
  label,
  caption,
  value,
  onValueChange,
}: {
  label: string
  caption?: string
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <View className="mb-6 flex-row items-center">
      <View className="mr-4 flex-1">
        <Text className="font-ko text-ko-14 text-ink">{label}</Text>
        {caption ? <Text className="mt-1 font-ko text-ko-12 text-ink-soft">{caption}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.line, true: colors.main.DEFAULT }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.line}
      />
    </View>
  )
}
