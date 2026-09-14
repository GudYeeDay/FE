# GudYeeDay FE

Expo(React Native) 기반 모바일 앱.

## 기술 스택

- **Expo SDK 57** / **React Native 0.86** / **React 19** / **TypeScript**
- **Expo Router** – `app/` 폴더 기반 파일 라우팅 (typed routes 활성화)
- **NativeWind 4** – React Native용 Tailwind CSS (`className` 사용, Tailwind v3 문법)
- **TanStack Query 5** – 서버 상태 관리 (`src/lib/query-client.ts`)
- ESLint(`eslint-config-expo`) / Prettier(+ tailwind 클래스 정렬)

## 요구 사항

- Node 22.12 이상 (`.node-version` 참고, `fnm use` 로 전환)
- pnpm
- iOS: Xcode + 시뮬레이터, Android: Android Studio + 에뮬레이터
- 실기기 테스트는 **Expo Go** 앱 설치 후 QR 스캔

## 시작하기

```bash
pnpm install
cp .env.example .env.local   # 필요 시 API 주소 수정
pnpm start                   # Metro 시작 → i(iOS) / a(Android) / w(웹)
```

| 명령             | 설명                                   |
| ---------------- | -------------------------------------- |
| `pnpm start`     | Metro 개발 서버 (Expo Go / 시뮬레이터) |
| `pnpm ios`       | iOS 시뮬레이터로 바로 실행             |
| `pnpm android`   | Android 에뮬레이터로 바로 실행         |
| `pnpm web`       | 웹 브라우저로 실행                     |
| `pnpm typecheck` | TypeScript 검사                        |
| `pnpm lint`      | ESLint                                 |
| `pnpm format`    | Prettier 포맷팅                        |
| `pnpm doctor`    | expo-doctor (의존성/설정 진단)         |

## 폴더 구조

```
app/                # Expo Router 라우트 (파일 = 화면)
├── _layout.tsx     # 루트 레이아웃: QueryClientProvider, Stack, global.css
└── index.tsx       # 홈 화면 (/)
src/
├── api/            # fetch 래퍼, 엔드포인트별 요청 함수
├── components/     # 공용 UI 컴포넌트
├── hooks/          # 커스텀 훅 (useQuery 래핑, AppState 연동 등)
└── lib/            # queryClient 등 앱 전역 인스턴스
assets/             # 아이콘, 스플래시 이미지
global.css          # Tailwind 진입점
tailwind.config.js  # NativeWind 프리셋, content 경로
```

`@/` 는 `src/` 를 가리키는 경로 별칭입니다. (`import { queryClient } from '@/lib/query-client'`)

## 환경 변수

`EXPO_PUBLIC_` 접두사가 붙은 변수만 앱 번들에 포함됩니다. `process.env.EXPO_PUBLIC_API_BASE_URL` 로 접근합니다.

## 메모

- NativeWind 4 는 Tailwind **v3** 기반입니다. v4 문법(`@theme`, `@import "tailwindcss"`)은 쓰지 않습니다.
- `tailwind.config.js` 의 `darkMode: 'class'` 는 웹 실행 시 발생하는 색상 스킴 오류를 막기 위한 설정입니다. 다크 모드 토글은 `nativewind` 의 `colorScheme.set()` 을 사용합니다.
- 네이티브 모듈이 추가되면 Expo Go 로는 실행이 안 되고 개발 빌드(`npx expo run:ios`)가 필요합니다.
