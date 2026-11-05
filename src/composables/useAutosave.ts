import { useDebounceFn, useLocalStorage, useNow } from '@vueuse/core'
import { computed, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

// Eigenes Composable nach VueUse-Vorbild: ein Formular, das sich selbst speichert.
// Es setzt sich aus drei VueUse-Bausteinen zusammen:
//   useLocalStorage → Entwurf überlebt das Neuladen der Seite
//   useDebounceFn   → erst speichern, wenn kurz nicht mehr getippt wird
//   useNow          → Anzeige „gespeichert vor 3 s“

export interface UseAutosaveOptions {
  /** Pause nach dem letzten Tippen, bevor gespeichert wird (ms). Wert, Ref oder Getter. */
  delay?: MaybeRefOrGetter<number>
}

export function useAutosave<T extends object>(key: string, initial: T, options: UseAutosaveOptions = {}) {
  const leer = JSON.stringify(initial)

  // 1) Gespeicherter Stand im localStorage (Standardwert wird nicht extra geschrieben)
  const stored = useLocalStorage<T | null>(key, initial, { writeDefaults: false, mergeDefaults: true })

  // 2) Das Formular arbeitet auf einer Kopie
  const form = ref({ ...initial, ...stored.value }) as Ref<T>
  const restored = ref(JSON.stringify(form.value) !== leer)
  const savedAt = ref<number | null>(null)

  // 3) Speichern mit Verzögerung – nicht bei jedem einzelnen Buchstaben
  const save = useDebounceFn(
    () => {
      if (JSON.stringify(form.value) === leer) {
        stored.value = null // leerer Entwurf → Eintrag entfernen
        savedAt.value = null
        return
      }
      stored.value = { ...form.value }
      savedAt.value = Date.now()
    },
    () => toValue(options.delay) ?? 500,
  )
  watch(form, () => save(), { deep: true })

  // 4) „vor X Sekunden“ – useNow ist eine reaktive Uhr und räumt sich selbst auf
  const now = useNow()
  const secondsAgo = computed(() =>
    savedAt.value === null ? null : Math.max(0, Math.round((now.value.getTime() - savedAt.value) / 1000)),
  )

  // Entwurf verwerfen
  function clear() {
    form.value = { ...initial }
    stored.value = null
    savedAt.value = null
    restored.value = false
  }

  // Bereitgestellte Schnittstelle: Refs + Funktion, destrukturierbar
  return { form, savedAt, secondsAgo, restored, clear }
}
