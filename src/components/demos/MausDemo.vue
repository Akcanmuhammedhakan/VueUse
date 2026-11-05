<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { useMouseSelbstgebaut } from '../../composables/useMouseSelbstgebaut'

// Links: selbst gebaut (eigene Datei, Listener von Hand)
const selbst = useMouseSelbstgebaut()
// Rechts: VueUse (1 Zeile, räumt sich automatisch auf)
const { x, y } = useMouse()
</script>

<template>
  <div class="vergleich">
    <div class="box">
      <span class="label">Selbst gebaut</span>
      <strong>{{ selbst.x }} / {{ selbst.y }}</strong>
      <pre class="code"><code>const x = ref(0)
const y = ref(0)
const update = (e) => {
  x.value = e.pageX
  y.value = e.pageY
}
onMounted(() =>
  addEventListener('mousemove', update))
onUnmounted(() =>
  removeEventListener('mousemove', update))</code></pre>
      <span class="zeilen">10 Zeilen · Aufräumen selbst</span>
    </div>
    <div class="box vueuse">
      <span class="label">VueUse useMouse()</span>
      <strong>{{ x }} / {{ y }}</strong>
      <pre class="code"><code>const { x, y } = useMouse()</code></pre>
      <span class="zeilen">1 Zeile · Aufräumen automatisch</span>
    </div>
  </div>
  <p class="hinweis">Gleiches Ergebnis – rechts aber ohne eigenen Listener-Code.</p>
</template>

<style scoped>
.vergleich {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.box {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.box.vueuse {
  border-color: var(--accent);
}
.label {
  font-size: 0.8rem;
}
.code {
  margin: 6px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--code-bg, rgba(127, 127, 127, 0.1));
  font-family: var(--mono);
  font-size: 0.68rem;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre;
}
.zeilen {
  font-size: 0.75rem;
  font-weight: 600;
}
.box.vueuse .zeilen {
  color: var(--accent);
}
strong {
  font-family: var(--mono);
  font-size: 1.3rem;
  color: var(--text-h);
}
</style>
