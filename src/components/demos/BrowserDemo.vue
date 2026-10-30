<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard, useOnline, useWindowSize } from '@vueuse/core'

const online = useOnline()
const { width, height } = useWindowSize()
const { copy, copied, isSupported } = useClipboard()

const text = computed(() => `Fenster: ${width.value} × ${height.value}`)
</script>

<template>
  <div class="zeile">
    <span>Netzwerk</span>
    <span class="status" :class="online ? 'an' : 'aus'">{{ online ? 'online' : 'offline' }}</span>
  </div>
  <div class="zeile">
    <span>Fenstergröße</span>
    <strong>{{ width }} × {{ height }}</strong>
  </div>
  <button class="btn" :disabled="!isSupported" @click="copy(text)">
    {{ copied ? 'Kopiert ✓' : 'Fenstergröße kopieren' }}
  </button>
  <p class="hinweis">Tipp: DevTools → Network → „Offline“ zeigt den Statuswechsel live.</p>
</template>

<style scoped>
.zeile {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
strong {
  font-family: var(--mono);
  color: var(--text-h);
}
.status {
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}
.an {
  background: #d7f5e3;
  color: #116336;
}
.aus {
  background: #fde2e1;
  color: #9b1c1c;
}
</style>
