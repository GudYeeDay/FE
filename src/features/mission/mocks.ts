import type { Mission } from './types'

// TODO: 미션 추천 API 연동 후 삭제
export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: '퇴근길 한 정거장 걸어보기',
    description: '버스 대신 두 다리로,\n노을을 조금 더 오래 보기',
  },
  {
    id: 'm2',
    title: '혼자 가는 카페에서 창가 자리 앉기',
    description: '창밖을 보면서\n아무것도 안 하는 시간 갖기',
  },
  {
    id: 'm3',
    title: '동네 골목 지도 없이 걸어보기',
    description: '처음 보는 골목으로\n일부러 길을 잃어보기',
  },
  {
    id: 'm4',
    title: '오늘 하늘 사진 한 장 남기기',
    description: '고개를 들어\n지금 하늘을 기록하기',
  },
  {
    id: 'm5',
    title: '안 가본 빵집에서 빵 하나 사기',
    description: '늘 가던 곳 말고\n새로운 곳의 맛 찾기',
  },
  {
    id: 'm6',
    title: '손으로 짧은 편지 써보기',
    description: '고마운 사람에게\n세 줄짜리 편지 쓰기',
  },
  {
    id: 'm7',
    title: '공원 벤치에서 10분 앉아있기',
    description: '휴대폰은 내려두고\n바람 소리 듣기',
  },
]
