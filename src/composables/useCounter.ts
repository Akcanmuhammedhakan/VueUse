import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

// Eigenes Composable nach VueUse-Vorbild:
// 1. Name beginnt mit "use"
// 2. Optionen dürfen fester Wert, Ref oder Getter sein (MaybeRefOrGetter + toValue)
// 3. Rückgabe: reaktiver Zustand + Funktionen als Objekt (destrukturierbar)
// 4. Kein Template, kein DOM – reine, isoliert testbare Logik

export interface UseCounterOptions {
  min?: MaybeRefOrGetter<number>
  max?: MaybeRefOrGetter<number>
}

export function useCounter(initialValue = 0, options: UseCounterOptions = {}) {
  const count = ref(initialValue)

  const min = () => toValue(options.min) ?? Number.NEGATIVE_INFINITY
  const max = () => toValue(options.max) ?? Number.POSITIVE_INFINITY

  const clamp = (value: number) => Math.min(max(), Math.max(min(), value))

  const inc = (step = 1) => { count.value = clamp(count.value + step) }
  const dec = (step = 1) => { count.value = clamp(count.value - step) }
  const set = (value: number) => { count.value = clamp(value) }
  const reset = () => { count.value = clamp(initialValue) }

  const isMin = computed(() => count.value <= min())
  const isMax = computed(() => count.value >= max())

  return { count, inc, dec, set, reset, isMin, isMax }
}
