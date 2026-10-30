import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useCounter } from './useCounter'

// Composables sind reine Funktionen → testbar ohne Komponente und ohne Browser.
describe('useCounter', () => {
  it('startet mit dem Startwert', () => {
    const { count } = useCounter(5)
    expect(count.value).toBe(5)
  })

  it('zählt hoch und runter', () => {
    const { count, inc, dec } = useCounter()
    inc()
    inc(5)
    dec(2)
    expect(count.value).toBe(4)
  })

  it('hält die Grenzen min und max ein', () => {
    const { count, inc, dec, isMax } = useCounter(0, { min: 0, max: 3 })
    dec()
    expect(count.value).toBe(0)
    inc(10)
    expect(count.value).toBe(3)
    expect(isMax.value).toBe(true)
  })

  it('akzeptiert ein Ref als Option (MaybeRefOrGetter)', () => {
    const max = ref(10)
    const { count, inc } = useCounter(0, { max })
    max.value = 2
    inc(5)
    expect(count.value).toBe(2)
  })

  it('setzt mit reset auf den Startwert zurück', () => {
    const { count, inc, reset } = useCounter(1)
    inc(3)
    reset()
    expect(count.value).toBe(1)
  })
})
