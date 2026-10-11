import { Image, Text, View } from 'react-native'

import type { PastRecord } from '@/features/home/api'

export const PAST_RECORD_CARD_WIDTH = 224

/** Figma: 지난 낭만들 카드 (사진 + 제목 + 본문 + 날짜·장소) */
export function PastRecordCard({ record }: { record: PastRecord }) {
  return (
    <View style={{ width: PAST_RECORD_CARD_WIDTH }}>
      <Image source={record.photo} className="h-[299px] w-full rounded-md" resizeMode="cover" />
      <View className="mt-2 gap-[2.7px] px-[10.7px]">
        <Text
          className="font-en-medium text-[10.7px] leading-[18.7px] tracking-[0.25px] text-ink"
          numberOfLines={1}
        >
          {record.title}
        </Text>
        <Text className="font-en text-[9.4px] leading-[14px] text-ink-soft" numberOfLines={2}>
          {record.body}
        </Text>
        <View className="flex-row items-center gap-[6.7px]">
          <Text className="font-ko text-[8px] leading-[11.8px] text-ink-soft">{record.date}</Text>
          <Text className="font-ko text-[8px] leading-[11.8px] text-ink-faint">•</Text>
          <Text className="font-ko text-[8px] leading-[11.8px] text-ink-soft" numberOfLines={1}>
            {record.place}
          </Text>
        </View>
      </View>
    </View>
  )
}
