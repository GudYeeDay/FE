import { Platform } from 'react-native'

type Card = {
  photoUri?: string
  title: string
  caption: string
}

function loadImage(uri: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image'))
    image.src = uri
  })
}

/** 사진, 미션명, 날짜를 한 장의 카드로 내려받는다. 웹에서만 동작한다. */
export async function downloadFeedCard(card: Card) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  ctx.fillStyle = '#1C1C1A'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  if (card.photoUri) {
    try {
      const image = await loadImage(card.photoUri)
      const scale = Math.max(canvas.width / image.width, 1080 / image.height)
      const width = image.width * scale
      const height = image.height * scale
      ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, 1120, canvas.width, 230)
    } catch {
      // 사진을 그리지 못하면 글자만 있는 카드로 저장한다.
    }
  }

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 48px sans-serif'
  ctx.fillText(card.title.slice(0, 28), 48, 1220)
  ctx.font = '32px sans-serif'
  ctx.fillText(card.caption.slice(0, 40), 48, 1288)

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/jpeg', 0.92)
  link.download = 'gudyeeday.jpg'
  link.click()
  return true
}
