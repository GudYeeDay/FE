import { Text, View } from 'react-native'

import { Button } from '@/components'
import { formatDotDate } from '@/features/mission/date'
import { missionStatusLabel, type Mission } from '@/features/mission/local'

type MissionCardProps = {
  mission: Mission
  /** 서버가 이미 만든 날짜 문구. 있으면 YYYY-MM-DD 변환 대신 그대로 보여 준다 */
  dateLabel?: string
  showStatus?: boolean
  action?: {
    label: string
    onPress: () => void
    variant?: 'primary' | 'subtle' | 'neutral'
  }
}

export function MissionCard({ mission, dateLabel, showStatus, action }: MissionCardProps) {
  return (
    <View className="rounded-lg border border-line bg-white px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 font-ko-medium text-ko-14 text-ink" numberOfLines={1}>
          {mission.title}
        </Text>
        {showStatus ? (
          <Text className="font-ko text-ko-12 text-main">{missionStatusLabel(mission.status)}</Text>
        ) : null}
      </View>
      {dateLabel || mission.date ? (
        <Text className="mt-1 font-en text-en-14 text-ink-soft">
          {dateLabel ?? formatDotDate(mission.date)}
        </Text>
      ) : null}
      {mission.memo ? (
        <Text className="mt-2 font-ko text-ko-14 text-ink">{mission.memo}</Text>
      ) : null}
      {action ? (
        <Button
          size="sm"
          variant={action.variant ?? 'primary'}
          className="mt-4 self-start px-4"
          onPress={action.onPress}
        >
          {action.label}
        </Button>
      ) : null}
    </View>
  )
}
