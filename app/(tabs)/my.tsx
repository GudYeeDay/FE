import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import * as AppleAuthentication from 'expo-apple-authentication'

import { errorText } from '@/api/http'
import { ChevronRightIcon } from '@/components/icons'
import { AccountDialog, type AccountAction } from '@/components/my/AccountDialog'
import { useSession } from '@/features/auth/session'
import { useArchive } from '@/features/archive/api'
import { useMyProfile, useWithdraw } from '@/features/my/api'
import { useMyInfo } from '@/features/my/store'
import { colors } from '@/theme'

const MENUS: { label: string; href: Href }[] = [
  { label: '이름 설정', href: '/my/name' },
  { label: '비밀번호 변경', href: '/my/password' },
  { label: '알림 설정', href: '/my/notifications' },
]

/**
 * 탈퇴 직전 애플 로그인을 다시 해서 authorizationCode 를 받는다 (서버가 애플 연동을 해제할 때 쓴다).
 * 사용자가 창을 닫으면 null
 */
async function appleAuthorizationCode(): Promise<string | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({ requestedScopes: [] })
    if (!credential.authorizationCode) throw new Error('authorizationCode 없음')
    return credential.authorizationCode
  } catch (error) {
    if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null
    throw error
  }
}

/** Figma: 마이페이지. 프로필·통계·설정 메뉴·로그아웃/회원탈퇴 */
export default function MyScreen() {
  const router = useRouter()
  const { signOut } = useSession()
  const profile = useMyProfile().data
  const { provider } = useMyInfo()
  const withdraw = useWithdraw()
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

  // 애플 연동 여부는 서버 프로필이 기준. 프로필을 못 받았으면 이 기기에 저장한 가입 방식으로 판단한다
  const appleLinked = profile?.appleLinked ?? provider === 'apple'

  /** 회원 탈퇴는 서버에서 성공해야 완료 안내를 띄운다. 로그아웃은 바로 진행 */
  const confirm = async (target: AccountAction) => {
    if (target !== 'withdraw') return true
    // 실패하면 확인 창은 그대로 두고 안내만 띄운다 (다시 누르거나 취소할 수 있게)
    let code: string | undefined
    if (appleLinked) {
      try {
        const received = await appleAuthorizationCode()
        if (!received) return false // 애플 창을 닫은 경우
        code = received
      } catch {
        Alert.alert('Apple 인증에 실패했어요', '잠시 후 다시 시도해 주세요.')
        return false
      }
    }
    try {
      await withdraw.mutateAsync(code)
      return true
    } catch (error) {
      Alert.alert('회원탈퇴를 하지 못했어요', errorText(error))
      return false
    }
  }

  const finish = useCallback(() => {
    // 탈퇴하면 서버가 토큰을 이미 지웠으므로 기기만 정리한다
    signOut({ local: action === 'withdraw' })
    setAction(null)
  }, [action, signOut])

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
          onPress={() => setAction('withdraw')}
        >
          <Text className="font-ko-medium text-ko-14 text-main">회원탈퇴</Text>
        </Pressable>
      </ScrollView>

      <AccountDialog
        action={action}
        onCancel={() => setAction(null)}
        onConfirm={confirm}
        onDone={finish}
      />
    </SafeAreaView>
  )
}
