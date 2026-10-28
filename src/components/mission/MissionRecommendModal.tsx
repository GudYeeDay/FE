import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { BookmarkFilledIcon, RefreshIcon } from '@/components/icons'
import { Dialog } from '@/components/ui/Dialog'
import { Toast } from '@/components/ui/Toast'
import { useRecommendedMissions } from '@/features/mission/api'
import { missionActions, useMissionStore } from '@/features/mission/store'
import type { Mission } from '@/features/mission/types'
import { colors } from '@/theme'
import { MissionCarousel } from './MissionCarousel'
import { MissionFan } from './MissionFan'
import { MissionStarted } from './MissionStarted'

/** Figma 오버레이 색 (Ink 70%) */
const DIM_COLOR = 'rgba(28, 28, 26, 0.7)'
/** 펼침 ↔ 선택 화면이 바뀌어도 카드 중심이 같은 자리에 오도록 카드 영역 높이를 고정 */
const CARD_AREA_HEIGHT = 330

/**
 * 미션 추천 흐름 (Figma 미션 추천 8개 프레임 + 프로토타입 연결)
 * 1. fan: "미션을 선택해보세요" + 작은 카드 3장이 한 장씩 들어와 부채꼴로 펼쳐짐
 * 2. focus: 카드를 누르면 그 카드가 큰 카드로 가운데 오고, 좌우로 넘기며 고름. "다른 미션 보기" 노출
 * 3. 시작하기 → 시작 확인 / 이미 진행 중이면 시작 불가 모달
 */
type Step =
  | { type: 'fan' }
  | { type: 'focus'; index: number }
  | { type: 'blocked' }
  | { type: 'started'; mission: Mission }

type Props = {
  visible: boolean
  onClose: () => void
}

export function MissionRecommendModal({ visible, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>({ type: 'fan' })
  const [toastKey, setToastKey] = useState<number | null>(null)
  const {
    data: missions,
    dataUpdatedAt,
    isPending,
    isFetching,
    refetch,
  } = useRecommendedMissions(visible)
  const archive = useMissionStore((s) => s.archive)
  const savedIds = useMemo(
    () => new Set(archive.filter((a) => a.status === 'saved').map((a) => a.mission.id)),
    [archive],
  )

  // 닫을 때 다음에 열 때를 위해 처음 단계로 되돌린다
  const close = () => {
    setStep({ type: 'fan' })
    setToastKey(null)
    onClose()
  }

  const start = (mission: Mission) => {
    // TODO: 미션 시작 API 연동
    if (missionActions.start(mission)) setStep({ type: 'started', mission })
    else setStep({ type: 'blocked' })
  }

  const toggleSaved = (mission: Mission) => {
    const willSave = !savedIds.has(mission.id)
    missionActions.toggleSaved(mission)
    // Figma 주석: 북마크를 누르면 잠깐(3초) 팝업 노출. 저장할 때만 띄운다
    if (willSave) setToastKey(Date.now())
  }

  const hideToast = useCallback(() => setToastKey(null), [])

  // 새 추천을 받으면 다시 펼침 화면부터
  const showOtherMissions = async () => {
    await refetch()
    setStep({ type: 'fan' })
  }

  if (step.type === 'started') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <MissionStarted title={step.mission.title} onGoHome={close} />
      </Modal>
    )
  }

  const picking = step.type === 'fan' || step.type === 'focus'

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      {/* Modal 은 앱 루트 밖에 그려져서, 캐러셀 제스처가 동작하려면 루트를 한 번 더 둬야 한다 */}
      <GestureHandlerRootView
        // 서드파티 컴포넌트라 NativeWind className 이 적용되지 않아 style 로 준다
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: DIM_COLOR,
        }}
      >
        {/* 카드 바깥을 누르면 닫힘 */}
        <Pressable
          accessibilityLabel="닫기"
          className="absolute inset-0"
          onPress={picking ? close : undefined}
        />

        {step.type === 'blocked' ? (
          <Dialog
            title="이미 진행중인 미션이 있어요"
            message={
              '한 번에 하나씩만 진행할 수 있어요.\n지금 진행중인 미션을 먼저 완료하거나 그만둔 뒤에\n새로 시작해 주세요.'
            }
            cancelLabel="확인"
            confirmLabel="진행중인 미션 보기"
            onCancel={() => setStep({ type: 'fan' })}
            onConfirm={() => {
              close()
              router.push('/mission/active')
            }}
          />
        ) : (
          <View className="w-full items-center" pointerEvents="box-none">
            {/* 제목은 펼침 화면에서만. 자리는 유지해서 카드가 위아래로 튀지 않게 한다 */}
            <Text
              className="mb-6 font-ko-bold text-ko-20 text-bg"
              style={{ opacity: step.type === 'fan' ? 1 : 0 }}
              accessibilityElementsHidden={step.type !== 'fan'}
            >
              미션을 선택해보세요
            </Text>

            <View style={{ height: CARD_AREA_HEIGHT, width: '100%' }} className="justify-center">
              {isPending || isFetching || !missions ? (
                <ActivityIndicator color={colors.bg} />
              ) : step.type === 'fan' ? (
                <MissionFan
                  key={dataUpdatedAt}
                  missions={missions}
                  savedIds={savedIds}
                  onSelect={(index) => setStep({ type: 'focus', index })}
                />
              ) : (
                <MissionCarousel
                  missions={missions}
                  savedIds={savedIds}
                  onToggleSaved={toggleSaved}
                  onStart={start}
                  initialIndex={step.index}
                />
              )}
            </View>

            {/* "다른 미션 보기"는 카드를 고른 뒤(focus)에만 보인다 */}
            <Pressable
              accessibilityRole="button"
              disabled={isFetching || step.type !== 'focus'}
              onPress={showOtherMissions}
              hitSlop={10}
              className="mt-2.5 flex-row items-end gap-1 active:opacity-70"
              style={{ opacity: step.type === 'focus' ? 1 : 0 }}
            >
              <RefreshIcon width={16} height={16} color={colors.bg} />
              <Text className="font-ko-medium text-ko-14 text-bg">다른 미션 보기</Text>
            </Pressable>
          </View>
        )}

        <Toast
          toastKey={toastKey}
          message="보관함에 저장되었어요!"
          icon={<BookmarkFilledIcon width={24} height={24} color={colors.ink.DEFAULT} />}
          onHide={hideToast}
        />
      </GestureHandlerRootView>
    </Modal>
  )
}
