# VueUse Live-Demo

Demo-App zur Präsentation **„VueUse“** im Modul *Komponentenbasierte Entwicklung* (HTW Berlin, WiSe 2026/27).
Autor: Muhammed Hakan Akcan

Stack: Vue 3 · TypeScript · Vite · [@vueuse/core](https://vueuse.org) v15 · Vitest

## Starten

```bash
npm install
npm run dev      # App auf http://localhost:5173
npm test         # Unit-Tests für das eigene Composable
```

## Inhalt

| # | Demo | Composables |
|---|------|-------------|
| – | Dark Mode (Button oben rechts) | `useDark`, `useToggle` |
| 1 | Selbst gebaut vs. VueUse | eigenes `useMouseSelbstgebaut` vs. `useMouse` |
| 2 | Popup mit Gedächtnis | `useLocalStorage`, `onClickOutside` |
| 3 | Browser-APIs reaktiv | `useOnline`, `useWindowSize`, `useClipboard` |
| 4 | Eigenes Composable nach VueUse-Vorbild | eigenes `useCounter`, `useTitle` |

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
│   └── useCounter.test.ts          # Vitest-Tests
└── style.css                       # Farben als CSS-Variablen (Light/Dark)
```
