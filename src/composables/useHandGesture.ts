import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision'
import { tryOnScopeDispose, useRafFn } from '@vueuse/core'
import { computed, ref, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { classifyGesture, type Gesture } from './gestures'

// Eigenes Composable nach VueUse-Vorbild:
// - Eingaben als MaybeRefOrGetter (Video-Element, an/aus)
// - nutzt selbst VueUse-Bausteine (useRafFn für die Bildschleife, tryOnScopeDispose fürs Aufräumen)
// - gibt nur reaktive Refs zurück – die Komponente weiß nichts von MediaPipe

export interface UseHandGestureOptions {
  /** Erkennung an/aus, z. B. gekoppelt an die Kamera */
  enabled?: MaybeRefOrGetter<boolean>
  /** So viele Bilder hintereinander muss eine Geste erkannt werden (gegen Flackern) */
  stableFrames?: number
}

const BASE = import.meta.env.BASE_URL

export function useHandGesture(
  video: MaybeRefOrGetter<HTMLVideoElement | null | undefined>,
  options: UseHandGestureOptions = {},
) {
  const { enabled = true, stableFrames = 4 } = options

  const isReady = ref(false)
  const error = shallowRef<string | null>(null)
  const landmarks = shallowRef<NormalizedLandmark[] | null>(null)
  const gesture = ref<Gesture>('none')
  const fps = ref(0)

  let landmarker: HandLandmarker | null = null
  let disposed = false
  let lastVideoTime = -1
  let candidate: Gesture = 'none'
  let candidateCount = 0
  let frames = 0
  let fpsSince = performance.now()

  async function create(delegate: 'GPU' | 'CPU') {
    const fileset = await FilesetResolver.forVisionTasks(`${BASE}mediapipe/wasm`)
    return HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${BASE}mediapipe/hand_landmarker.task`, delegate },
      runningMode: 'VIDEO',
      numHands: 1,
    })
  }

  async function init() {
    try {
      // GPU ist schneller; falls der Browser das nicht kann, auf CPU zurückfallen
      landmarker = await create('GPU').catch(() => create('CPU'))
      if (disposed) {
        landmarker.close()
        return
      }
      isReady.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  }
  init()

  function reset() {
    landmarks.value = null
    gesture.value = 'none'
    candidate = 'none'
    candidateCount = 0
    lastVideoTime = -1
    fps.value = 0
  }

  const { pause, resume } = useRafFn(
    () => {
      const el = toValue(video)
      if (!landmarker || !el || el.readyState < 2) return
      if (el.currentTime === lastVideoTime) return // kein neues Kamerabild
      lastVideoTime = el.currentTime

      const result = landmarker.detectForVideo(el, performance.now())
      const hand = result.landmarks[0] ?? null
      landmarks.value = hand

      // Geste erst übernehmen, wenn sie mehrere Bilder stabil ist
      const raw = hand ? classifyGesture(hand) : 'none'
      if (raw === candidate) candidateCount++
      else {
        candidate = raw
        candidateCount = 1
      }
      if (candidateCount >= stableFrames) gesture.value = candidate

      frames++
      const now = performance.now()
      if (now - fpsSince >= 1000) {
        fps.value = Math.round((frames * 1000) / (now - fpsSince))
        frames = 0
        fpsSince = now
      }
    },
    { immediate: false },
  )

  watch(
    () => isReady.value && toValue(enabled),
    (on) => {
      if (on) resume()
      else {
        pause()
        reset()
      }
    },
    { immediate: true },
  )

  // Spitze des Zeigefingers, gespiegelt wie ein Spiegelbild, auf 0..1 normiert.
  // Der mittlere Bildbereich (20–80 %) wird auf den ganzen Bildschirm gestreckt.
  const pointer = computed(() => {
    const tip = landmarks.value?.[8]
    if (!tip) return null
    const stretch = (v: number) => Math.min(1, Math.max(0, (v - 0.2) / 0.6))
    return { x: stretch(1 - tip.x), y: stretch(tip.y) }
  })

  tryOnScopeDispose(() => {
    disposed = true
    landmarker?.close()
    landmarker = null
  })

  return { isReady, error, landmarks, gesture, pointer, fps }
}
