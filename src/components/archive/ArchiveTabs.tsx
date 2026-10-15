import { Pressable, Text, View } from 'react-native'

import { cn } from '@/lib/cn'

export type ArchiveFilter = 'all' | 'saved' | 'done'

const TABS: { key: ArchiveFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'saved', label: '남은 미션' },
  { key: 'done', label: '완료 미션' },
]

/** Figma: Component (전체 / 남은 미션 / 완료 미션). 선택된 탭 아래 빨간 밑줄. */
export function ArchiveTabs({
  value,
  onChange,
}: {
  value: ArchiveFilter
  onChange: (v: ArchiveFilter) => void
}) {
  return (
    <View accessibilityRole="tablist" className="flex-row gap-[19px] border-b border-line">
      {TABS.map((tab) => {
        const selected = tab.key === value
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.key)}
            className="pb-4"
          >
            <Text
              className={cn('font-ko-medium text-ko-14', selected ? 'text-ink' : 'text-ink-faint')}
            >
              {tab.label}
            </Text>
            {selected ? (
              <View className="absolute -bottom-px -left-1 -right-1 h-[3px] rounded-full bg-main" />
            ) : null}
          </Pressable>
        )
      })}
    </View>
  )
}
