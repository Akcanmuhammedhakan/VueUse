<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { onClickOutside, useLocalStorage } from '@vueuse/core'

// Ref, das sich selbst im localStorage speichert → überlebt einen Reload
const offen = useLocalStorage('demo-popup-offen', false)
const name = useLocalStorage('demo-name', '')

// Klick neben das Popup schließt es; der Listener wird automatisch entfernt
const popup = useTemplateRef<HTMLElement>('popup')
onClickOutside(popup, () => {
  offen.value = false
})
</script>

<template>
  <label>
    Dein Name (wird gespeichert)
    <input v-model="name" placeholder="z. B. Hakan" />
  </label>
  <button class="btn" @click="offen = true">Popup öffnen</button>
  <div v-if="offen" ref="popup" class="popup">
    Hallo {{ name || 'Gast' }}! 👋<br />
    <small>Klick daneben schließt mich. Lade die Seite neu – ich bleibe offen.</small>
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
}
.popup {
  border: 2px solid var(--accent);
  background: var(--accent-bg);
  color: var(--text-h);
  border-radius: 12px;
  padding: 14px;
}
</style>
