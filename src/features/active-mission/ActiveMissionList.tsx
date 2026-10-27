import { ScrollView } from 'react-native'

import { RemoteMessage } from '@/api/RemoteMessage'
import { remoteErrorText, useSignedIn } from '@/api/http'
import { MissionCard } from '@/features/mission/MissionCard'
import { useCompleteMission, useInProgressMission } from '@/features/mission/remote'
import type { Mission } from '@/features/mission/local'

export function ActiveMissionList() {
  const query = useInProgressMission()
  const complete = useCompleteMission()
  const signedIn = useSignedIn()

  if (!signedIn) return <RemoteMessage text="로그인 후 볼 수 있어요" login />
  if (query.isLoading) return <RemoteMessage text="불러오는 중" />
  if (query.isError) return <RemoteMessage text={remoteErrorText(query.error)} />
  if (!query.data) {
    return <RemoteMessage text="진행 중인 미션이 없습니다." />
  }

  const mission: Mission = {
    id: String(query.data.userMissionId),
    title: query.data.title,
    memo: query.data.description,
    date: '',
    status: 'active',
  }

  return (
    <ScrollView className="min-h-0 flex-1" contentContainerClassName="gap-3 px-5 pb-8 pt-4">
      <MissionCard
        mission={mission}
        action={{
          label: complete.isPending ? '완료 중' : '완료하기',
          onPress: () => complete.mutate(),
        }}
      />
      {complete.isError ? <RemoteMessage text={remoteErrorText(complete.error)} /> : null}
    </ScrollView>
  )
}
