import { useEffect, type FC } from 'react'
import { Pressable, View, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, {
  Defs,
  FeBlend,
  FeColorMatrix,
  FeComposite,
  FeFlood,
  FeGaussianBlur,
  FeOffset,
  Filter,
  Path,
} from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from 'expo-router/tabs'
import type { SvgProps } from 'react-native-svg'

import {
  LoadingIcon,
  PlusIcon,
  TabArchiveIcon,
  TabCalendarIcon,
  TabHomeIcon,
  TabMyIcon,
} from '@/components/icons'
import { colors } from '@/theme'

const BAR_HEIGHT = 60
const PLUS_SIZE = 44
/** 배경이 시작되는 y (가운데 + 버튼이 이만큼 위로 튀어나온다) */
const BG_TOP = 7.6
/** 그림자 블러가 잘리지 않도록 SVG 사방에 주는 여백 */
const SHADOW_PAD = 8

const TAB_ICONS: Record<string, FC<SvgProps>> = {
  index: TabHomeIcon,
  calendar: TabCalendarIcon,
  archive: TabArchiveIcon,
  my: TabMyIcon,
}

/**
 * 가운데 버튼 상태 (Figma TabBar 의 미션추가 / 진행중 variant)
 * - add: 진한 빨강 + 아이콘. 누르면 미션 추천
 * - inProgress: 밝은 빨강 + 도는 로딩 아이콘. 진행 중인 미션이 있을 때
 */
export type CenterButtonState = 'add' | 'inProgress'

type Props = BottomTabBarProps & {
  centerState?: CenterButtonState
  onPressCenter: () => void
}

/**
 * Figma: Group 10 / TabBar(미션추가-홈)
 * 5칸: 홈 · 캘린더 · (+) · 보관함 · 마이. 가운데가 파인 곡선 배경은 화면 폭에 맞춰 Path 로 그린다.
 */
export function BottomTabBar({
  state,
  descriptors,
  navigation,
  centerState = 'add',
  onPressCenter,
}: Props) {
  const { width } = useWindowDimensions()
  const { bottom } = useSafeAreaInsets()

  const routes = state.routes.filter((r) => r.name in TAB_ICONS)
  const left = routes.slice(0, 2)
  const right = routes.slice(2)

  const renderTab = (route: (typeof state.routes)[number]) => {
    const focused = state.routes[state.index]?.key === route.key
    const Icon = TAB_ICONS[route.name]
    const { options } = descriptors[route.key]

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={options.title ?? route.name}
        className="flex-1 items-center pt-5"
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params)
        }}
      >
        <Icon width={24} height={24} color={focused ? colors.main.soft : colors.ink.DEFAULT} />
      </Pressable>
    )
  }

  return (
    <View style={{ height: BAR_HEIGHT + bottom }}>
      <TabBarBackground width={width} bottomInset={bottom} />
      <View className="flex-1 flex-row" style={{ paddingBottom: bottom }}>
        {left.map(renderTab)}
        <View className="flex-1 items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={centerState === 'inProgress' ? '진행중인 미션 보기' : '미션 추가'}
            onPress={onPressCenter}
            className={`items-center justify-center rounded-full active:opacity-80 ${
              centerState === 'inProgress' ? 'bg-main-soft' : 'bg-main'
            }`}
            style={{ width: PLUS_SIZE, height: PLUS_SIZE }}
          >
            {centerState === 'inProgress' ? (
              <SpinningLoadingIcon />
            ) : (
              <PlusIcon width={21.33} height={21.33} color={colors.bg} />
            )}
          </Pressable>
        </View>
        {right.map(renderTab)}
      </View>
    </View>
  )
}

/** Figma hugeicons:loading-03. 천천히 돈다. 시스템 '동작 줄이기'가 켜져 있으면 멈춰 있다. */
function SpinningLoadingIcon() {
  const reduceMotion = useReducedMotion()
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (reduceMotion) return
    rotation.value = withRepeat(withTiming(360, { duration: 1600, easing: Easing.linear }), -1)
    return () => cancelAnimation(rotation)
  }, [reduceMotion, rotation])

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }))

  return (
    <Animated.View style={style}>
      <LoadingIcon width={28} height={28} color={colors.white} />
    </Animated.View>
  )
}

/** Figma Vector 12: 가운데가 파인 흰 배경 + 위쪽 그림자(y -0.5, blur 4, 10%) */
function TabBarBackground({ width, bottomInset }: { width: number; bottomInset: number }) {
  const c = width / 2
  const top = BG_TOP
  const notch = BG_TOP + 40.4 // 홈의 가장 깊은 지점
  const bottom = BAR_HEIGHT + bottomInset

  const d = [
    `M${c} ${notch}`,
    `C${c - 32.5} ${notch} ${c - 23} ${top} ${c - 43} ${top}`,
    `H0 V${bottom} H${width} V${top} H${c + 43.5}`,
    `C${c + 22} ${top} ${c + 32.5} ${notch} ${c} ${notch} Z`,
  ].join(' ')

  return (
    <Svg
      width={width + SHADOW_PAD * 2}
      height={bottom + SHADOW_PAD}
      viewBox={`${-SHADOW_PAD} ${-SHADOW_PAD} ${width + SHADOW_PAD * 2} ${bottom + SHADOW_PAD}`}
      style={{ position: 'absolute', left: -SHADOW_PAD, top: -SHADOW_PAD }}
      pointerEvents="none"
    >
      <Defs>
        <Filter
          id="tabbar-shadow"
          x={-SHADOW_PAD}
          y={-SHADOW_PAD}
          width={width + SHADOW_PAD * 2}
          height={bottom + SHADOW_PAD}
          filterUnits="userSpaceOnUse"
        >
          <FeFlood floodOpacity={0} result="BackgroundImageFix" />
          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <FeOffset dy={-0.5} />
          <FeGaussianBlur stdDeviation={4} />
          <FeComposite in2="hardAlpha" operator="out" />
          <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <FeBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
          <FeBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
        </Filter>
      </Defs>
      <Path d={d} fill={colors.white} filter="url(#tabbar-shadow)" />
    </Svg>
  )
}
