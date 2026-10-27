import { useSyncExternalStore } from 'react'

type BookmarkEdit = { title: string; description: string }

const KEY = 'gyd.bookmarkEdits'

function readEdits(): Record<string, BookmarkEdit> {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, BookmarkEdit>) : {}
  } catch {
    return {}
  }
}

let edits = readEdits()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function saveBookmarkEdit(id: string, edit: BookmarkEdit) {
  edits = { ...edits, [id]: edit }
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(edits))
  } catch {
    // 저장에 실패해도 이번 화면의 수정은 유지한다.
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useBookmarkEdits() {
  return useSyncExternalStore(subscribe, () => edits, () => edits)
}
