import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'

import { ChevronRightIcon } from '@/components/icons'
import { AccountDialog, type AccountAction } from '@/components/my/AccountDialog'
import { useSession } from '@/features/auth/session'
import { useArchive } from '@/features/archive/api'
import { useMyProfile } from '@/features/my/api'
import { colors } from '@/theme'

const MENUS: { label: string; href: Href }[] = [
  { label: '이름 설정', href: '/my/name' },
  { label: '비밀번호 변경', href: '/my/password' },
  { label: '알림 설정', href: '/my/notifications' },
]

/** Figma: 마이페이지. 프로필·통계·설정 메뉴·로그아웃/회원탈퇴 */
export default function MyScreen() {
  const router = useRouter()
  const { signOut } = useSession()
  const profile = useMyProfile().data
  const archive = useArchive().data
  const [action, setAction] = useState<AccountAction | null>(null)

  const name = profile?.name ?? ''
  // 서버 프로필의 record 는 시작한 미션 수, complete 는 완료한 미션 수.
  // left(시작했지만 완료 안 한 수)는 "저장 미션" 과 뜻이 달라서 보관함의 저장 상태 개수를 쓴다
  const stats = [
    { label: '기록한 미션', value: profile?.record ?? 0 },
    { label: '완료 미션', value: profile?.complete ?? 0 },
    { label: '저장 미션', value: archive?.filter((a) => a.status === 'saved').length ?? 0 },
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
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="ml-3">
            <Text className="font-ko-bold text-ko-20 text-ink">{name}</Text>
            <Text className="mt-0.5 font-ko text-ko-12 text-ink-soft">굳이 시작한 지 {profile?.date ?? 1}일째</Text>
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
          // 서버에 탈퇴 API 가 아직 없어서, 탈퇴된 것처럼 보이지 않게 안내만 한다
          onPress={() => Alert.alert('회원탈퇴는 준비 중이에요', '조금만 기다려 주세요.')}
        >
          <Text className="font-ko-medium text-ko-14 text-main">회원탈퇴</Text>
        </Pressable>
      </ScrollView>

      <AccountDialog action={action} onCancel={() => setAction(null)} onDone={finish} />
    </SafeAreaView>
  )
}
