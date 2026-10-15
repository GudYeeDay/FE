import { useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { RefreshIcon } from '@/components/icons'
import { Dialog } from '@/components/ui/Dialog'
import { useRecommendedMissions } from '@/features/mission/api'
import { missionActions, useMissionStore } from '@/features/mission/store'
import type { Mission } from '@/features/mission/types'
import { colors } from '@/theme'
import { MissionCarousel } from './MissionCarousel'
import { MissionStarted } from './MissionStarted'

/** Figma 오버레이 색 (Ink 70%) */
const DIM_COLOR = 'rgba(28, 28, 26, 0.7)'

type Step = { type: 'pick' } | { type: 'blocked' } | { type: 'started'; mission: Mission }

type Props = {
  visible: boolean
  onClose: () => void
}

/**
 * Figma: 미션 추천 → 시작 확인 / 시작 불가 모달
 * 탭 바 가운데 + 버튼으로 열리고, 홈 위에 어둡게 겹쳐서 보인다.
 */
export function MissionRecommendModal({ visible, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>({ type: 'pick' })
  const { data: missions, isPending, isFetching, refetch } = useRecommendedMissions(visible)
  const archive = useMissionStore((s) => s.archive)
  const savedIds = useMemo(
    () => new Set(archive.filter((a) => a.status === 'saved').map((a) => a.mission.id)),
    [archive],
  )

  // 닫을 때 다음에 열 때를 위해 처음 단계로 되돌린다
  const close = () => {
    setStep({ type: 'pick' })
    onClose()
  }

  const start = (mission: Mission) => {
    // TODO: 미션 시작 API 연동
    if (missionActions.start(mission)) setStep({ type: 'started', mission })
    else setStep({ type: 'blocked' })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      {step.type === 'started' ? (
        <MissionStarted title={step.mission.title} onGoHome={close} />
      ) : (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: DIM_COLOR }}>
          {/* 카드 바깥을 누르면 닫힘 */}
          <Pressable
            accessibilityLabel="닫기"
            className="absolute inset-0"
            onPress={step.type === 'pick' ? close : undefined}
          />

          {step.type === 'blocked' ? (
            <Dialog
              title="이미 진행중인 미션이 있어요"
              message={
                '한 번에 하나씩만 진행할 수 있어요.\n지금 진행중인 미션을 먼저 완료하거나 그만둔 뒤에\n새로 시작해 주세요.'
              }
              cancelLabel="확인"
              confirmLabel="진행중인 미션 보기"
              onCancel={() => setStep({ type: 'pick' })}
              onConfirm={() => {
                close()
                router.push('/mission/active')
              }}
            />
          ) : (
            <View className="w-full items-center" pointerEvents="box-none">
              <Text className="mb-6 font-ko-bold text-ko-20 text-bg">미션을 선택해보세요</Text>

              {isPending || !missions ? (
                <View className="h-[330px] justify-center">
                  <ActivityIndicator color={colors.bg} />
                </View>
              ) : (
                <MissionCarousel
                  missions={missions}
                  savedIds={savedIds}
                  onToggleSaved={missionActions.toggleSaved}
                  onStart={start}
                />
              )}

              <Pressable
                accessibilityRole="button"
                disabled={isFetching}
                onPress={() => refetch()}
                hitSlop={10}
                className="mt-2.5 flex-row items-end gap-1 active:opacity-70"
              >
                <RefreshIcon width={16} height={16} color={colors.bg} />
                <Text className="font-ko-medium text-ko-14 text-bg">다른 미션 보기</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </Modal>
  )
}
