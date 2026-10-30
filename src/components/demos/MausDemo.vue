<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { useMouseSelbstgebaut } from '../../composables/useMouseSelbstgebaut'

// Links: selbst gebaut (12 Zeilen in eigener Datei)
const selbst = useMouseSelbstgebaut()
// Rechts: VueUse (1 Zeile, räumt sich automatisch auf)
const { x, y } = useMouse()
</script>

<template>
  <div class="vergleich">
    <div class="box">
      <span class="label">Selbst gebaut</span>
      <strong>{{ selbst.x }} / {{ selbst.y }}</strong>
    </div>
    <div class="box vueuse">
      <span class="label">VueUse useMouse()</span>
      <strong>{{ x }} / {{ y }}</strong>
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
strong {
  font-family: var(--mono);
  font-size: 1.3rem;
  color: var(--text-h);
}
</style>
