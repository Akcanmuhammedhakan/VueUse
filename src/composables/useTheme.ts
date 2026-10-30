import { createSharedComposable, useDark, useToggle } from '@vueuse/core'

// createSharedComposable: alle Komponenten teilen sich denselben Zustand
// (App-Kopf und Gestensteuerung schalten denselben Dark Mode)
export const useTheme = createSharedComposable(() => {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  return { isDark, toggleDark }
})
