import { onMounted, onUnmounted, ref } from 'vue'

// Ohne VueUse: alles von Hand – Zustand, Listener anmelden, Listener abmelden.
// Wer onUnmounted vergisst, hat ein Memory Leak.
export function useMouseSelbstgebaut() {
  const x = ref(0)
  const y = ref(0)

  const update = (e: MouseEvent) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
