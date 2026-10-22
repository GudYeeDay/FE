import { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { Button, Header } from '@/components'
import { Dialog } from '@/components/ui/Dialog'
import { missionActions, useMissionStore } from '@/features/mission/store'

/**
 * Figma: 진행중 미션 상세 / 그만두기 확인.
 * 하단 탭바가 보이는 화면이라 (tabs) 안에 숨은 탭으로 둔다.
 */
export default function ActiveMissionScreen() {
  const router = useRouter()
  const active = useMissionStore((s) => s.active)
  const [confirmQuit, setConfirmQuit] = useState(false)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title="진행중인 미션" align="center" />

      {active ? (
        <>
          <View className="flex-1 px-5 pt-6">
            <Text className="font-ko-bold text-ko-20 text-ink">{active.title}</Text>
            <Text className="mt-4 font-en text-en-14 text-[#AFAFAF]">{active.description}</Text>
          </View>
          <View className="items-center px-[30px] pb-[38px]">
            <Button onPress={() => router.push('/record/new')}>기록하러 가기</Button>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setConfirmQuit(true)}
              className="mt-[21px]"
            >
              <Text className="font-ko-medium text-ko-14 text-ink-faint">이 미션 그만두기</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="font-ko text-ko-14 text-ink-soft">진행중인 미션이 없어요</Text>
        </View>
      )}

      <Modal
        visible={confirmQuit}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setConfirmQuit(false)}
      >
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(28, 28, 26, 0.7)' }}
        >
          <Dialog
            showMark={false}
            title="이 미션을 그만둘까요?"
            message={'지금 그만두면 진행 중이던 미션은 사라지고,\n추천받기로 새로 시작해야 해요.'}
            cancelLabel="취소"
            confirmLabel="그만두기"
            onCancel={() => setConfirmQuit(false)}
            onConfirm={() => {
              // TODO: 미션 그만두기 API 연동
              setConfirmQuit(false)
              missionActions.quit()
              router.navigate('/')
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  )
}
