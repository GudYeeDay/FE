import { ScrollView } from 'react-native'

import { RemoteMessage } from '@/api/RemoteMessage'
import { remoteErrorText, useSignedIn } from '@/api/http'
import { useBookmarks } from '@/features/archive/api'
import { MissionCard } from '@/features/mission/MissionCard'
import type { Mission } from '@/features/mission/local'

export function RecordList() {
  const query = useBookmarks('COMPLETED')
  const signedIn = useSignedIn()

  if (!signedIn) return <RemoteMessage text="로그인 후 볼 수 있어요" login />
  if (query.isLoading) return <RemoteMessage text="불러오는 중" />
  if (query.isError) return <RemoteMessage text={remoteErrorText(query.error)} />

  const done = query.data?.bookmarks ?? []
  if (done.length === 0) return <RemoteMessage text="완료한 기록이 없습니다." />

  return (
    <ScrollView className="min-h-0 flex-1" contentContainerClassName="gap-3 px-5 pb-8 pt-4">
      {done.map((item) => {
        const mission: Mission = {
          id: String(item.bookmarkId),
          title: item.title,
          memo: '',
          date: '',
          status: 'done',
        }
        return <MissionCard key={item.bookmarkId} mission={mission} dateLabel={item.date} />
      })}
    </ScrollView>
  )
}
