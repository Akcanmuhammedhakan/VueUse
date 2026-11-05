<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue'
import { HandLandmarker } from '@mediapipe/tasks-vision'
import { useDevicesList, useLocalStorage, useRafFn, useSpeechSynthesis, useUserMedia, useWindowSize } from '@vueuse/core'
import { useHandGesture } from '../../composables/useHandGesture'
import { useTheme } from '../../composables/useTheme'
import type { Gesture } from '../../composables/gestures'

// 1) Kamera – VueUse: Geräteliste + Stream; gewählte Kamera wird gemerkt
const { videoInputs, ensurePermissions } = useDevicesList()
const kameraId = useLocalStorage('demo-kamera', '')
const constraints = ref<MediaStreamConstraints>({ video: true, audio: false })
watch(
  kameraId,
  (id) => {
    constraints.value = {
      video: { width: 640, height: 480, ...(id ? { deviceId: { exact: id } } : { facingMode: 'user' }) },
      audio: false,
    }
  },
  { immediate: true },
)
const { stream, enabled: kameraAn } = useUserMedia({ constraints, autoSwitch: true })
// Gerätenamen gibt der Browser erst nach der Kamera-Erlaubnis heraus
watch(stream, (s) => {
  if (s) ensurePermissions()
})
const aktiveKamera = computed(() => stream.value?.getVideoTracks()[0]?.label ?? '')
const video = useTemplateRef<HTMLVideoElement>('video')
watchEffect(() => {
  if (video.value) video.value.srcObject = stream.value ?? null
})

// 2) Handerkennung – eigenes Composable
const { isReady, error, landmarks, gesture, pointer, fps } = useHandGesture(video, { enabled: kameraAn })

// 3) Aktionen – wieder VueUse
const { toggleDark } = useTheme()
const name = useLocalStorage('demo-name', '')
const dankeText = computed(() => (name.value ? `Danke, ${name.value}!` : 'Danke schön!'))
const { speak, isSupported: sprachausgabe } = useSpeechSynthesis(dankeText, { lang: 'de-DE', rate: 1.05 })

const gesten: { id: Gesture; emoji: string; name: string; aktion: string }[] = [
  { id: 'pointing', emoji: '👆', name: 'Zeigefinger', aktion: 'Cursor steuern' },
  { id: 'pinch', emoji: '🤏', name: 'Daumen + Zeigefinger', aktion: 'Klicken / Regler ziehen' },
  { id: 'pointing', emoji: '⏱️', name: '1 s auf Button zeigen', aktion: 'Klickt auch (ohne Pinch)' },
  { id: 'open_palm', emoji: '✋', name: 'Offene Hand halten', aktion: 'Dark Mode umschalten' },
  { id: 'thumbs_up', emoji: '👍', name: 'Daumen hoch halten', aktion: 'Seite bedankt sich' },
]

// ---- Cursor: folgt der Zeigefingerspitze, geglättet ----
const { width, height } = useWindowSize()
const cursor = ref({ x: 0, y: 0 })
const handSichtbar = computed(() => kameraAn.value && pointer.value !== null)
let hoverEl: HTMLElement | null = null

function elementAn(x: number, y: number): HTMLElement | null {
  const el = document.elementFromPoint(x, y)
  return (el?.closest('button, input[type="range"]') as HTMLElement | null) ?? null
}
const elementUnterCursor = () => elementAn(cursor.value.x, cursor.value.y)

// Beim Zusammenführen von Daumen + Zeigefinger wandert die Fingerspitze nach unten.
// Darum merken wir uns die Cursor-Positionen der letzten Zeit und klicken dort,
// wo der Cursor kurz VOR dem Pinch stand.
const VERLAUF_MS = 250
const verlauf: { t: number; x: number; y: number }[] = []
function positionVorPinch() {
  const grenze = performance.now() - VERLAUF_MS
  return verlauf.find((p) => p.t >= grenze) ?? { x: cursor.value.x, y: cursor.value.y }
}

function klicken(el: HTMLElement | null) {
  if (el instanceof HTMLButtonElement && !el.disabled) el.click()
  klickBlitz.value = true
  setTimeout(() => (klickBlitz.value = false), 250)
}

// Verweil-Klick als Sicherheitsnetz: Cursor 1 s still auf einem Button → Klick
const VERWEILEN_MS = 1000
let verweilEl: HTMLElement | null = null
let verweilStart = 0
let verweilFertig = false
const verweilFortschritt = ref(0)

function setHover(el: HTMLElement | null) {
  if (el === hoverEl) return
  hoverEl?.classList.remove('gesture-hover')
  el?.classList.add('gesture-hover')
  hoverEl = el
}

// ---- Halte-Gesten: erst nach kurzer Haltezeit auslösen ----
const HALTEN_MS: Partial<Record<Gesture, number>> = { open_palm: 1200, thumbs_up: 700 }
let halteStart = 0
let ausgeloest = false
const halteFortschritt = ref(0)
const klickBlitz = ref(false)

watch(gesture, (neu, alt) => {
  halteStart = performance.now()
  ausgeloest = false
  halteFortschritt.value = 0

  // Pinch beginnt → Klick dort, wo der Cursor kurz vorher stand
  if (neu === 'pinch' && alt !== 'pinch') {
    const p = positionVorPinch()
    const el = elementAn(p.x, p.y)
    if (!(el instanceof HTMLInputElement)) {
      cursor.value = { x: p.x, y: p.y } // Cursor zurück auf den Button springen lassen
      klicken(el)
      verweilFertig = true // kein zweiter Klick durchs Verweilen
    }
  }
})

function reglerZiehen(el: HTMLInputElement) {
  const rect = el.getBoundingClientRect()
  const anteil = Math.min(1, Math.max(0, (cursor.value.x - rect.left) / rect.width))
  const min = Number(el.min || 0)
  const max = Number(el.max || 100)
  const wert = String(Math.round(min + anteil * (max - min)))
  if (el.value !== wert) {
    el.value = wert
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

useRafFn(() => {
  // Cursor weich nachziehen: kleine Bewegungen stark glätten (kein Zittern),
  // große Bewegungen schnell folgen lassen
  if (pointer.value) {
    const zielX = pointer.value.x * width.value
    const zielY = pointer.value.y * height.value
    const dx = zielX - cursor.value.x
    const dy = zielY - cursor.value.y
    const weg = Math.hypot(dx, dy)
    const faktor = weg < 6 ? 0.08 : weg < 40 ? 0.25 : 0.5
    // während des Pinch-Klicks auf Buttons stillhalten
    const festhalten = gesture.value === 'pinch' && !(hoverEl instanceof HTMLInputElement)
    if (!festhalten) cursor.value = { x: cursor.value.x + dx * faktor, y: cursor.value.y + dy * faktor }

    const jetzt = performance.now()
    verlauf.push({ t: jetzt, x: cursor.value.x, y: cursor.value.y })
    while (verlauf.length && verlauf[0].t < jetzt - 1000) verlauf.shift()

    const el = elementUnterCursor()
    setHover(el)
    if (gesture.value === 'pinch' && el instanceof HTMLInputElement) reglerZiehen(el)

    // Verweil-Klick
    const knopf = el instanceof HTMLButtonElement && !el.disabled ? el : null
    if (knopf !== verweilEl) {
      verweilEl = knopf
      verweilStart = jetzt
      verweilFertig = false
    }
    if (knopf && !verweilFertig && gesture.value !== 'pinch') {
      verweilFortschritt.value = Math.min(1, (jetzt - verweilStart) / VERWEILEN_MS)
      if (verweilFortschritt.value >= 1) {
        verweilFertig = true
        klicken(knopf)
      }
    } else {
      verweilFortschritt.value = 0
    }
  } else {
    setHover(null)
    verweilEl = null
    verweilFortschritt.value = 0
    verlauf.length = 0
  }

  // Halte-Gesten
  const dauer = HALTEN_MS[gesture.value]
  if (dauer && !ausgeloest) {
    halteFortschritt.value = Math.min(1, (performance.now() - halteStart) / dauer)
    if (halteFortschritt.value >= 1) {
      ausgeloest = true
      if (gesture.value === 'open_palm') toggleDark()
      if (gesture.value === 'thumbs_up' && sprachausgabe.value) speak()
    }
  }
})

// ---- Hand-Skelett über das Kamerabild zeichnen ----
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
watch(landmarks, (lm) => {
  const c = canvas.value
  const v = video.value
  if (!c || !v) return
  if (c.width !== v.videoWidth) c.width = v.videoWidth
  if (c.height !== v.videoHeight) c.height = v.videoHeight
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, c.width, c.height)
  if (!lm) return
  ctx.lineWidth = 4
  ctx.strokeStyle = '#42b883'
  for (const { start, end } of HandLandmarker.HAND_CONNECTIONS) {
    ctx.beginPath()
    ctx.moveTo(lm[start].x * c.width, lm[start].y * c.height)
    ctx.lineTo(lm[end].x * c.width, lm[end].y * c.height)
    ctx.stroke()
  }
  lm.forEach((p, i) => {
    ctx.beginPath()
    ctx.fillStyle = i === 8 || i === 4 ? '#e3a93b' : '#ffffff'
    ctx.arc(p.x * c.width, p.y * c.height, i === 8 || i === 4 ? 8 : 5, 0, Math.PI * 2)
    ctx.fill()
  })
})

const status = computed(() => {
  if (error.value) return { text: 'Fehler beim Laden', klasse: 'aus' }
  if (!isReady.value) return { text: 'Modell lädt …', klasse: 'laedt' }
  if (!kameraAn.value) return { text: 'Bereit – Kamera aus', klasse: 'laedt' }
  return { text: `Läuft · ${fps.value} FPS`, klasse: 'an' }
})
</script>

<template>
  <div class="layout">
    <div class="kamera" :class="{ aktiv: kameraAn }">
      <video ref="video" autoplay playsinline muted />
      <canvas ref="canvas" />
      <div v-if="!kameraAn" class="platzhalter">
        <span>📷</span>
        Kamera ist aus
      </div>
      <div v-if="kameraAn && !landmarks" class="platzhalter klein">Hand in die Kamera halten</div>
    </div>

    <div class="steuerung">
      <div class="zeile">
        <button class="btn" :disabled="!isReady" @click="kameraAn = !kameraAn">
          {{ kameraAn ? 'Kamera aus' : 'Kamera an' }}
        </button>
        <span class="status" :class="status.klasse">{{ status.text }}</span>
      </div>
      <p v-if="error" class="hinweis">{{ error }}</p>
      <label class="auswahl">
        Kamera
        <select v-model="kameraId">
          <option value="">Standard{{ aktiveKamera && !kameraId ? ` (${aktiveKamera})` : '' }}</option>
          <option v-for="d in videoInputs" :key="d.deviceId" :value="d.deviceId">
            {{ d.label || 'Kamera ' + (videoInputs.indexOf(d) + 1) }}
          </option>
        </select>
      </label>

      <ul class="gesten">
        <li v-for="g in gesten" :key="g.name" :class="{ aktiv: gesture === g.id }">
          <span class="emoji">{{ g.emoji }}</span>
          <span class="text">
            <strong>{{ g.name }}</strong>
            <small>{{ g.aktion }}</small>
          </span>
          <span
            v-if="gesture === g.id && HALTEN_MS[g.id]"
            class="balken"
            :style="{ transform: `scaleX(${halteFortschritt})` }"
          />
        </li>
      </ul>
      <p class="hinweis">Erkannt: <code>{{ gesture }}</code> · Die Maus funktioniert weiterhin normal.</p>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="handSichtbar"
      class="gesten-cursor"
      :class="{ pinch: gesture === 'pinch', blitz: klickBlitz }"
      :style="{
        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
        '--verweilen': `${verweilFortschritt * 360}deg`,
      }"
    >
      <span v-if="verweilFortschritt > 0" class="verweil-ring" />
    </div>
  </Teleport>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 760px) {
  .layout {
    grid-template-columns: 1.2fr 1fr;
  }
}
.kamera {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background: #0d1411;
}
video,
canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* wie ein Spiegel */
}
.platzhalter {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  color: #b5c2ba;
  gap: 6px;
}
.platzhalter span {
  font-size: 2.4rem;
}
.platzhalter.klein {
  place-content: end center;
  padding-bottom: 14px;
  font-size: 0.9rem;
}
.steuerung {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.zeile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.status {
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}
.status.an {
  background: #d7f5e3;
  color: #116336;
}
.status.aus {
  background: #fde2e1;
  color: #9b1c1c;
}
.status.laedt {
  background: var(--accent-bg);
  color: var(--accent-text);
}
.auswahl {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}
.auswahl select {
  flex: 1;
  font: inherit;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
}
.gesten {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.gesten li {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: border-color 0.15s, background 0.15s;
}
.gesten li.aktiv {
  border-color: var(--accent);
  background: var(--accent-bg);
}
.emoji {
  font-size: 1.6rem;
}
.text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.text strong {
  color: var(--text-h);
}
.balken {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 4px;
  width: 100%;
  background: var(--accent);
  transform-origin: left;
}
</style>

<style>
/* global, weil der Cursor per Teleport im <body> hängt */
.gesten-cursor {
  position: fixed;
  left: -18px;
  top: -18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 4px solid #42b883;
  background: rgba(66, 184, 131, 0.15);
  pointer-events: none;
  z-index: 9999;
  transition: width 0.1s, height 0.1s, left 0.1s, top 0.1s, background 0.1s;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.25);
}
.gesten-cursor.pinch {
  left: -12px;
  top: -12px;
  width: 24px;
  height: 24px;
  background: #e3a93b;
  border-color: #e3a93b;
}
.gesten-cursor.blitz {
  box-shadow: 0 0 0 14px rgba(227, 169, 59, 0.35);
}
.verweil-ring {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: conic-gradient(#e3a93b var(--verweilen), transparent 0);
  mask: radial-gradient(circle, transparent 58%, #000 60%);
  -webkit-mask: radial-gradient(circle, transparent 58%, #000 60%);
}
.gesture-hover {
  outline: 3px solid #e3a93b !important;
  outline-offset: 3px;
}
</style>
