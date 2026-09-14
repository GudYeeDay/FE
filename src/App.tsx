import { useQuery } from '@tanstack/react-query'

// 환경 설정 확인용 샘플 쿼리. 실제 API가 붙으면 src/api/ 아래로 옮기고 이 파일은 라우팅 진입점으로 쓴다.
function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300))
      return { status: 'ok', checkedAt: new Date().toLocaleTimeString() }
    },
  })
}

export default function App() {
  const { data, isPending, refetch, isFetching } = useHealthCheck()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">GudYeeDay FE</h1>
      <p className="text-sm text-gray-500">
        Vite · React · TypeScript · Tailwind CSS · TanStack Query
      </p>

      <div className="rounded-lg border border-gray-200 px-6 py-4 text-sm shadow-sm">
        {isPending ? (
          <span className="text-gray-400">확인 중…</span>
        ) : (
          <span>
            status: <strong className="text-green-600">{data?.status}</strong> · {data?.checkedAt}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
      >
        {isFetching ? '불러오는 중' : '다시 확인'}
      </button>
    </main>
  )
}
