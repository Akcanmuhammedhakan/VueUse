# VueUse Live-Demo

Demo-App zur Präsentation **„VueUse“** im Modul *Komponentenbasierte Entwicklung* (HTW Berlin, WiSe 2026/27).
Autor: Muhammed Hakan Akcan

Stack: Vue 3 · TypeScript · Vite · [@vueuse/core](https://vueuse.org) v15 · Vitest · [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) (läuft lokal im Browser, offline)

## Starten

```bash
npm install
npm run dev      # App auf http://localhost:5173
npm test         # Unit-Tests: useCounter + Gestenerkennung
```

## Inhalt

| # | Demo | Composables |
|---|------|-------------|
| – | Dark Mode (Button oben rechts) | `useDark`, `useToggle` |
| 1 | Selbst gebaut vs. VueUse | eigenes `useMouseSelbstgebaut` vs. `useMouse` |
| 2 | Popup mit Gedächtnis | `useLocalStorage`, `onClickOutside` |
| 3 | Browser-APIs reaktiv | `useOnline`, `useWindowSize`, `useClipboard` |
| 4 | Eigenes Composable nach VueUse-Vorbild | eigenes `useCounter`, `useTitle` |
| 5 | **Finale: Steuerung per Handgeste** (Webcam) | `useUserMedia`, `useRafFn`, `useSpeechSynthesis`, `createSharedComposable`, eigenes `useHandGesture` |

### Gesten (Demo 5)

| Geste | Aktion |
|---|---|
| 👆 Zeigefinger | Cursor folgt der Fingerspitze |
| 🤏 Daumen + Zeigefinger | Klick auf Button unter dem Cursor, Regler ziehen |
| ⏱️ 1 s auf einem Button verweilen | Klick ohne Pinch (Sicherheitsnetz) |
| ✋ Offene Hand 1,2 s halten | Dark Mode umschalten |
| 👍 Daumen hoch 0,7 s halten | Seite sagt „Danke, ‹Name›!“ |

Modell und WASM-Dateien liegen in `public/mediapipe/` – es wird **kein Internet** benötigt.

## Projektstruktur

```
src/
├── App.vue                         # Seite, Dark-Mode-Schalter
├── components/
│   ├── DemoCard.vue                # wiederverwendbarer Rahmen (Props + Slot)
│   └── demos/                      # eine Komponente pro Demo
├── composables/
│   ├── useMouseSelbstgebaut.ts     # ohne VueUse: Listener von Hand
│   ├── useCounter.ts               # eigenes Composable im VueUse-Stil
│   ├── useCounter.test.ts          # Vitest-Tests
│   ├── useHandGesture.ts           # eigenes Composable: Webcam-Bild → Hand-Punkte → Geste
│   ├── gestures.ts                 # reine Gesten-Logik (ohne Vue/Browser)
│   ├── gestures.test.ts            # Vitest-Tests der Gesten
│   └── useTheme.ts                 # Dark Mode, geteilt per createSharedComposable
└── style.css                       # Farben als CSS-Variablen (Light/Dark)
```
