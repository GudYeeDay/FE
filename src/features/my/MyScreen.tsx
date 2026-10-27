import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter, type Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { RemoteMessage } from '@/api/RemoteMessage'
import { remoteErrorText, useSignedIn } from '@/api/http'
import { ChevronRightIcon } from '@/components/icons'
import { ConfirmDialog, NoticeDialog } from '@/features/my/AccountDialog'
import { useBookmarks } from '@/features/archive/api'
import { useLogout, useMyProfile } from '@/features/my/api'
import { colors } from '@/theme'

const MENU = [
  { href: '/my/name', label: '이름 설정' },
  { href: '/my/password', label: '비밀번호 변경' },
  { href: '/my/email', label: '메일 인증' },
  { href: '/my/notifications', label: '알림 설정' },
] as const

export function MyScreen() {
  const router = useRouter()
  const profile = useMyProfile()
  const bookmarks = useBookmarks('ALL')
  const signedIn = useSignedIn()
  const logout = useLogout()
  const [dialog, setDialog] = useState<'logout-ask' | 'logout-done' | 'withdraw-ask' | 'withdraw-done' | null>(
    null,
  )

  const name = profile.data?.name ?? ''
  const initial = name.trim().slice(0, 1) || 'P'
  const days = profile.data?.date
  const memberDays = days && days > 0 && days < 20000 ? `${days}일째` : null
  const savedCount = bookmarks.data?.bookmarks.filter((item) => item.status === 'SAVED').length ?? 0

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-4">
        <View className="flex-row items-center">
          <View className="h-14 w-14 items-center justify-center rounded-full border border-ink">
            <Text className="font-ko-medium text-ko-16 text-ink">{initial}</Text>
          </View>
          <View className="ml-3 min-w-0 flex-1">
            <Text className="font-ko-bold text-[18px] text-ink">{name || ' '}</Text>
            {memberDays ? <Text className="mt-1 font-ko text-ko-12 text-ink-soft">가입 {memberDays}</Text> : null}
          </View>
        </View>

        {!signedIn ? (
          <RemoteMessage text="로그인 후 볼 수 있어요" />
        ) : profile.isLoading ? (
          <RemoteMessage text="불러오는 중" />
        ) : profile.isError ? (
          <RemoteMessage text={remoteErrorText(profile.error)} />
        ) : (
          <View className="mt-6 flex-row rounded-2xl bg-bg py-4">
            <Stat value={profile.data?.record ?? 0} label="기록" />
            <View className="w-px bg-line" />
            <Stat value={profile.data?.complete ?? 0} label="완료" />
            <View className="w-px bg-line" />
            <Stat value={savedCount} label="저장" />
          </View>
        )}

        <View className="mt-4 overflow-hidden rounded-2xl border border-line">
          {MENU.map((item, index) => (
            <Pressable
              key={item.href}
              accessibilityRole="button"
              className={`flex-row items-center px-4 py-4 ${index > 0 ? 'border-t border-line' : ''}`}
              onPress={() => router.push(item.href as Href)}
            >
              <Text className="flex-1 font-ko text-ko-14 text-ink">{item.label}</Text>
              <ChevronRightIcon width={18} height={18} color={colors.ink.soft} />
            </Pressable>
          ))}
        </View>

        {signedIn ? (
          <>
            <Pressable
              accessibilityRole="button"
              className="mt-4 rounded-2xl bg-bg px-4 py-4"
              onPress={() => setDialog('logout-ask')}
            >
              <Text className="font-ko text-ko-14 text-main">로그아웃</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="mt-3 rounded-2xl bg-bg px-4 py-4"
              onPress={() => setDialog('withdraw-ask')}
            >
              <Text className="font-ko text-ko-14 text-main">회원탈퇴</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            className="mt-4 rounded-2xl bg-bg px-4 py-4"
            onPress={() => router.push('/login')}
          >
            <Text className="font-ko text-ko-14 text-main">로그인</Text>
          </Pressable>
        )}
      </ScrollView>

      {dialog === 'logout-ask' ? (
        <ConfirmDialog
          visible
          title="로그아웃"
          body="로그아웃을 진행하시겠어요?"
          confirmLabel="로그아웃"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            logout.mutate(undefined, {
              onSettled: () => {
                setDialog(null)
                setTimeout(() => setDialog('logout-done'), 0)
              },
            })
          }}
        />
      ) : null}
      {dialog === 'logout-done' ? (
        <NoticeDialog
          visible
          title="로그아웃 완료"
          body="로그아웃이 완료되었습니다"
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'withdraw-ask' ? (
        <ConfirmDialog
          visible
          title="회원탈퇴"
          body={'계정과 기록한 낭만이 모두 사라져요\n탈퇴한 계정은 되돌릴 수 없어요'}
          confirmLabel="탈퇴하기"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setDialog(null)
            setTimeout(() => setDialog('withdraw-done'), 0)
          }}
        />
      ) : null}
      {dialog === 'withdraw-done' ? (
        <NoticeDialog
          visible
          title="회원탈퇴 완료"
          body={'회원탈퇴가 완료되었습니다\n그동안 낭만을 기록해주셔서 감사합니다'}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </SafeAreaView>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="font-ko-bold text-[20px] text-main">{value}</Text>
      <Text className="mt-1 font-ko text-ko-12 text-ink-soft">{label}</Text>
    </View>
  )
}
