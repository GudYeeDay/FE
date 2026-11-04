import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'

import { ChevronRightIcon } from '@/components/icons'
import { AccountDialog, type AccountAction } from '@/components/my/AccountDialog'
import { useSession } from '@/features/auth/session'
import { useMissionStore } from '@/features/mission/store'
import { useMyProfile } from '@/features/my/store'
import { useRecordStore } from '@/features/record/store'
import { todayISO } from '@/lib/date'
import { colors } from '@/theme'

const MENUS: { label: string; href: Href }[] = [
  { label: '이름 설정', href: '/my/name' },
  { label: '비밀번호 변경', href: '/my/password' },
  { label: '알림 설정', href: '/my/notifications' },
]

const DAY_MS = 24 * 60 * 60 * 1000

/** Figma: 마이페이지. 프로필·통계·설정 메뉴·로그아웃/회원탈퇴 */
export default function MyScreen() {
  const router = useRouter()
  const { signOut } = useSession()
  const profile = useMyProfile()
  const records = useRecordStore((s) => s.records)
  const archive = useMissionStore((s) => s.archive)
  const [action, setAction] = useState<AccountAction | null>(null)

  const days = Math.max(1, Math.floor((Date.parse(todayISO()) - Date.parse(profile.joinedAt)) / DAY_MS) + 1)
  const stats = [
    { label: '기록한 미션', value: records.length },
    { label: '완료 미션', value: archive.filter((a) => a.status === 'done').length },
    { label: '저장 미션', value: archive.filter((a) => a.status === 'saved').length },
  ]

  const finish = useCallback(() => {
    setAction(null)
    signOut()
  }, [signOut])

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-5 pb-10 pt-8">
        <View className="flex-row items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full border border-ink">
            <Text className="font-en-medium text-en-16 text-ink">
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="ml-3">
            <Text className="font-ko-bold text-ko-20 text-ink">{profile.name}</Text>
            <Text className="mt-0.5 font-ko text-ko-12 text-ink-soft">굳이 시작한 지 {days}일째</Text>
          </View>
        </View>

        <View className="mt-5 flex-row rounded-xl bg-bg py-4">
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              className={`flex-1 items-center ${index > 0 ? 'border-l border-line' : ''}`}
            >
              <Text className="font-en-medium text-en-16 text-main">{stat.value}</Text>
              <Text className="mt-1.5 font-ko text-ko-12 text-ink-soft">{stat.label}</Text>
            </View>
          ))}
        </View>

        <View className="mt-5 rounded-xl border border-line px-4">
          {MENUS.map((menu) => (
            <Pressable
              key={menu.label}
              accessibilityRole="button"
              className="h-14 flex-row items-center justify-between active:opacity-70"
              onPress={() => router.push(menu.href)}
            >
              <Text className="font-ko text-ko-14 text-ink">{menu.label}</Text>
              <ChevronRightIcon width={20} height={20} color={colors.ink.soft} />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          className="mt-5 h-12 justify-center rounded-xl bg-bg px-4 active:opacity-70"
          onPress={() => setAction('logout')}
        >
          <Text className="font-ko-medium text-ko-14 text-main">로그아웃</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="mt-3 h-12 justify-center rounded-xl bg-bg px-4 active:opacity-70"
          onPress={() => setAction('withdraw')}
        >
          <Text className="font-ko-medium text-ko-14 text-main">회원탈퇴</Text>
        </Pressable>
      </ScrollView>

      <AccountDialog action={action} onCancel={() => setAction(null)} onDone={finish} />
    </SafeAreaView>
  )
}
