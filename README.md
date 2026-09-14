# GudYeeDay FE

## 기술 스택

- **Vite 8** – 번들러 / 개발 서버
- **React 19** + **TypeScript**
- **Tailwind CSS 4** – `@tailwindcss/vite` 플러그인 방식 (설정 파일 없이 `src/index.css`의 `@theme`으로 커스터마이즈)
- **TanStack Query 5** – 서버 상태 관리 (`src/lib/query-client.ts`)
- oxlint / Prettier (+ tailwind 클래스 정렬 플러그인)

## 시작하기

```bash
pnpm install
cp .env.example .env.local   # 필요 시 API 주소 수정
pnpm dev
```

| 명령           | 설명                       |
| -------------- | -------------------------- |
| `pnpm dev`     | 개발 서버 (localhost:5173) |
| `pnpm build`   | 타입체크 + 프로덕션 빌드   |
| `pnpm preview` | 빌드 결과 미리보기         |
| `pnpm lint`    | oxlint                     |
| `pnpm format`  | Prettier 포맷팅            |

## 폴더 구조

```
src/
├── api/          # fetch 래퍼, 엔드포인트별 요청 함수
├── components/   # 공용 UI 컴포넌트
├── hooks/        # 커스텀 훅 (useQuery 래핑 등)
├── lib/          # queryClient 등 앱 전역 인스턴스
├── pages/        # 라우트 단위 페이지
├── App.tsx
├── main.tsx      # QueryClientProvider 등 프로바이더 조립
└── index.css     # Tailwind 진입점 + 테마 토큰
```

`@/` 는 `src/` 를 가리키는 경로 별칭입니다. (`import { queryClient } from '@/lib/query-client'`)

## 환경 변수

`VITE_` 접두사가 붙은 변수만 클라이언트에 노출됩니다. 타입은 `src/vite-env.d.ts` 에서 관리합니다.
