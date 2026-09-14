import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분 동안은 refetch 없이 캐시 사용
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
