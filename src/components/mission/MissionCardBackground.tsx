import { useId } from 'react'
import { View } from 'react-native'
import Svg, { Defs, Ellipse, LinearGradient, Stop } from 'react-native-svg'

/**
 * Figma: Card-L 배경 장식. 빨강 → 진한 빨강 그라데이션(투명도 3%) 타원 두 개.
 * 값은 Figma 의 배치 박스(left/top/width/height)와 타원 크기·회전을 그대로 옮겼다.
 */
type Blob = {
  box: { left: number; top: number; width: number; height: number }
  ellipse: { width: number; height: number }
  rotate: number
  flipY?: boolean
}

export const MISSION_CARD_VARIANTS: Blob[][] = [
  // 1-L
  [
    {
      box: { left: 37, top: 105, width: 227.972, height: 199.572 },
      ellipse: { width: 124.793, height: 192 },
      rotate: -62.39,
      flipY: true,
    },
    {
      box: { left: -16, top: -65, width: 222.013, height: 149.772 },
      ellipse: { width: 124.105, height: 207.791 },
      rotate: 97.38,
    },
  ],
  // 2-L
  [
    {
      box: { left: -72.82, top: -56.58, width: 215.361, height: 208.113 },
      ellipse: { width: 108, height: 192 },
      rotate: 48.5,
      flipY: true,
    },
    {
      box: { left: 38.5, top: 125.25, width: 218.579, height: 227.47 },
      ellipse: { width: 124.793, height: 192 },
      rotate: -140.37,
      flipY: true,
    },
  ],
  // 3-L
  [
    {
      box: { left: 60, top: -70, width: 184.692, height: 220.189 },
      ellipse: { width: 108, height: 192 },
      rotate: -27.61,
    },
    {
      box: { left: -66, top: 80, width: 199.572, height: 227.972 },
      ellipse: { width: 124.793, height: 192 },
      rotate: -152.39,
      flipY: true,
    },
  ],
]

export function MissionCardBackground({ variant }: { variant: number }) {
  const blobs = MISSION_CARD_VARIANTS[variant % MISSION_CARD_VARIANTS.length]
  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
      {blobs.map((blob, i) => (
        <BlobShape key={i} blob={blob} />
      ))}
    </View>
  )
}

function BlobShape({ blob }: { blob: Blob }) {
  const gradientId = `mission-card-blob-${useId()}`
  const { width, height } = blob.ellipse

  return (
    <View
      style={{
        position: 'absolute',
        ...blob.box,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width,
          height,
          transform: [{ rotate: `${blob.rotate}deg` }, { scaleY: blob.flipY ? -1 : 1 }],
        }}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient
              id={gradientId}
              x1={width / 2}
              y1={0}
              x2={width / 2}
              y2={height}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset={0} stopColor="#C80408" />
              <Stop offset={1} stopColor="#620204" />
            </LinearGradient>
          </Defs>
          <Ellipse
            cx={width / 2}
            cy={height / 2}
            rx={width / 2}
            ry={height / 2}
            fill={`url(#${gradientId})`}
            fillOpacity={0.03}
          />
        </Svg>
      </View>
    </View>
  )
}
