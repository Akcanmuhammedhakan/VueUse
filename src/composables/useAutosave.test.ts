import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useAutosave } from './useAutosave'

const KEY = 'test-entwurf'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

describe('useAutosave', () => {
  it('speichert erst nach einer Tipp-Pause', async () => {
    const { form } = useAutosave(KEY, { text: '' })
    form.value.text = 'Hallo'
    await nextTick()
    vi.advanceTimersByTime(300)
    expect(localStorage.getItem(KEY)).toBeNull()
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(localStorage.getItem(KEY)).toContain('Hallo')
  })

  it('stellt den Entwurf nach dem Neuladen wieder her', () => {
    localStorage.setItem(KEY, JSON.stringify({ text: 'Hallo' }))
    const { form, restored } = useAutosave(KEY, { text: '' })
    expect(form.value.text).toBe('Hallo')
    expect(restored.value).toBe(true)
  })

  it('löscht den Entwurf mit clear()', async () => {
    localStorage.setItem(KEY, JSON.stringify({ text: 'Hallo' }))
    const { form, clear } = useAutosave(KEY, { text: '' })
    clear()
    await nextTick()
    vi.advanceTimersByTime(600)
    await nextTick()
    expect(form.value.text).toBe('')
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('nimmt die Verzögerung auch als Ref an', async () => {
    const delay = ref(2000)
    const { form } = useAutosave(KEY, { text: '' }, { delay })
    form.value.text = 'Hallo'
    await nextTick()
    vi.advanceTimersByTime(600)
    await nextTick()
    expect(localStorage.getItem(KEY)).toBeNull()
    vi.advanceTimersByTime(1500)
    await nextTick()
    expect(localStorage.getItem(KEY)).toContain('Hallo')
  })
})
