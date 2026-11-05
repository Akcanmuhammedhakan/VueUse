<script setup lang="ts">
import DemoCard from './components/DemoCard.vue'
import MausDemo from './components/demos/MausDemo.vue'
import PopupDemo from './components/demos/PopupDemo.vue'
import BrowserDemo from './components/demos/BrowserDemo.vue'
import AutosaveDemo from './components/demos/AutosaveDemo.vue'
import GestureDemo from './components/demos/GestureDemo.vue'
import { useTheme } from './composables/useTheme'

// Dark Mode: useDark + useToggle, geteilt über createSharedComposable (siehe useTheme.ts)
const { isDark, toggleDark } = useTheme()
</script>

<template>
  <header class="kopf">
    <div>
      <p class="kicker">Komponentenbasierte Entwicklung · HTW Berlin</p>
      <h1>VueUse Live-Demo</h1>
    </div>
    <button class="btn" @click="toggleDark()">
      {{ isDark ? '☀️ Light' : '🌙 Dark' }}
    </button>
  </header>

  <main class="grid">
    <DemoCard :nummer="1" titel="Selbst gebaut vs. VueUse" :composables="['useMouse']">
      <MausDemo />
    </DemoCard>
    <DemoCard :nummer="2" titel="Popup mit Gedächtnis" :composables="['useLocalStorage', 'onClickOutside']">
      <PopupDemo />
    </DemoCard>
    <DemoCard :nummer="3" titel="Browser-APIs reaktiv" :composables="['useOnline', 'useWindowSize', 'useClipboard']">
      <BrowserDemo />
    </DemoCard>
    <DemoCard
      :nummer="4"
      titel="Formular speichert sich selbst"
      :composables="['useAutosave (eigen)', 'useLocalStorage', 'useDebounceFn', 'useNow']"
    >
      <AutosaveDemo />
    </DemoCard>
    <DemoCard
      class="breit"
      :nummer="5"
      titel="Finale: Steuerung per Handgeste"
      :composables="['useUserMedia', 'useRafFn', 'useSpeechSynthesis', 'useHandGesture (eigen)']"
    >
      <GestureDemo />
    </DemoCard>
  </main>
</template>

<style scoped>
.kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.kicker {
  margin: 0 0 4px;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent-text);
  font-weight: 600;
}
h1 {
  margin: 0;
  font-size: 2.2rem;
  color: var(--text-h);
}
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 760px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
  .breit {
    grid-column: 1 / -1;
  }
}
</style>
