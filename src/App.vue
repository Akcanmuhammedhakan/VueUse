<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import DemoCard from './components/DemoCard.vue'
import MausDemo from './components/demos/MausDemo.vue'
import PopupDemo from './components/demos/PopupDemo.vue'
import BrowserDemo from './components/demos/BrowserDemo.vue'
import CounterDemo from './components/demos/CounterDemo.vue'

// Dark Mode in zwei Zeilen: setzt class="dark" auf <html> und merkt sich die Wahl
const isDark = useDark()
const toggleDark = useToggle(isDark)
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
    <DemoCard :nummer="4" titel="Eigenes Composable" :composables="['useCounter (eigen)', 'useTitle']">
      <CounterDemo />
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
}
</style>
