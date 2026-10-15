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
app/                    # Expo Router 라우트 (파일 = 화면)
├── _layout.tsx         # 루트: 폰트 로드, QueryClientProvider, Stack
├── (auth)/             # 로그인 전: login · email-login · signup · terms · find-password
├── (tabs)/             # 하단 탭: index(홈) · calendar · archive · my
├── archive/[id].tsx    # 저장한 미션 상세
└── mission/            # new(커스텀 미션 추가·수정), active(진행 중 미션)
src/
├── api/                # fetch 래퍼, 엔드포인트별 요청 함수
├── components/
│   ├── ui/             # Button, TextField, Checkbox
│   ├── navigation/     # Header, BottomTabBar
│   └── icons.ts        # assets/icons/*.svg 를 컴포넌트로 export
├── features/
│   ├── auth/           # 세션, 입력 규칙(validation), 이메일 인증 훅
│   ├── mission/        # 진행 중 미션·보관함 스토어, 추천 미션 API
│   ├── home/           # 홈 요약 API
│   └── calendar/       # 캘린더 기록 API
├── theme/              # 컬러 토큰 (tailwind.config.js 와 공유)
├── hooks/          # 커스텀 훅 (useQuery 래핑, AppState 연동 등)
└── lib/            # queryClient 등 앱 전역 인스턴스
assets/             # 아이콘, 스플래시 이미지
global.css          # Tailwind 진입점
tailwind.config.js  # NativeWind 프리셋, content 경로
```

`@/` 는 `src/` 를 가리키는 경로 별칭입니다. (`import { queryClient } from '@/lib/query-client'`)

## 환경 변수

`EXPO_PUBLIC_` 접두사가 붙은 변수만 앱 번들에 포함됩니다. `process.env.EXPO_PUBLIC_API_BASE_URL` 로 접근합니다.

## 디자인 시스템

Figma 기준 토큰을 `tailwind.config.js` 에 등록했습니다.

- 컬러: `main`, `main-soft`, `ink`, `ink-soft`, `ink-faint`, `line`, `bg`, `brand-10`~`brand-100`
- 폰트: `font-ko` / `font-ko-medium` (Noto Sans KR), `font-en` / `font-en-medium` (Inter)
- 크기: `text-ko-12` / `text-ko-14` / `text-ko-16` / `text-en-14` / `text-en-16` (행간·자간 포함)

```tsx
import { Button, Checkbox, Header, TextField } from '@/components'
```

- SVG 는 `assets/icons/` 에 두고 `src/components/icons.ts` 에서 export 합니다. 색이 바뀌는 아이콘은 `currentColor` 로 저장해 `color` prop 으로 칠합니다.
- `Header` 는 레이아웃에 고정하지 않았습니다. 필요한 화면에서만 넣습니다.
- 홈 탭은 현재 공용 컴포넌트 쇼케이스입니다. 홈 화면 작업 시 교체합니다.

## 인증 흐름

로그인 → 이메일 로그인 / 회원가입 → 약관 동의 → 홈. 이메일 로그인에서 비밀번호 찾기로 갈 수 있습니다.

- `app/_layout.tsx` 에서 `Stack.Protected` 로 로그인 여부에 따라 `(auth)` 와 `(tabs)` 를 나눕니다.
- 입력 규칙과 에러 문구는 `src/features/auth/validation.ts` 한 곳에서 관리합니다.
- 아직 API 가 없어서 로그인 상태는 메모리에만 있고, 인증번호는 시간 안에 4자리를 넣으면 통과합니다. 연동할 곳은 `TODO` 주석으로 표시해 두었습니다.

## 목업 데이터

아직 API 가 없어서 홈·캘린더·추천 미션·보관함은 목업입니다. 각 `src/features/*/api.ts` 와 `src/features/mission/store.ts` 의 `TODO` 위치만 실제 API 로 바꾸면 됩니다. 예시 사진은 `assets/mock/` 에 있고 API 연동 후 삭제합니다.

## 메모

- NativeWind 4 는 Tailwind **v3** 기반입니다. v4 문법(`@theme`, `@import "tailwindcss"`)은 쓰지 않습니다.
- `tailwind.config.js` 의 `darkMode: 'class'` 는 웹 실행 시 발생하는 색상 스킴 오류를 막기 위한 설정입니다. 다크 모드 토글은 `nativewind` 의 `colorScheme.set()` 을 사용합니다.
- 네이티브 모듈이 추가되면 Expo Go 로는 실행이 안 되고 개발 빌드(`npx expo run:ios`)가 필요합니다.
