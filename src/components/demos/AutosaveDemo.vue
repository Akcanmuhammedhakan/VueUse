<script setup lang="ts">
import { computed } from 'vue'
import { useAutosave } from '../../composables/useAutosave'

// Eigenes Composable: Formular speichert sich selbst und überlebt das Neuladen
const { form, secondsAgo, restored, clear } = useAutosave('demo-feedback', { sterne: 0, kommentar: '' })

const status = computed(() => {
  if (secondsAgo.value !== null) return `✓ Gespeichert vor ${secondsAgo.value} s`
  if (restored.value) return '↺ Entwurf wiederhergestellt'
  return 'Noch nichts gespeichert'
})
</script>

<template>
  <p class="frage">Wie gefällt euch der Vortrag?</p>
  <div class="sterne">
    <button
      v-for="n in 5"
      :key="n"
      class="stern"
      :class="{ an: n <= form.sterne }"
      :aria-label="`${n} Sterne`"
      @click="form.sterne = n"
    >
      ★
    </button>
  </div>
  <label>
    Kommentar
    <textarea v-model="form.kommentar" rows="3" placeholder="Einfach lostippen …" />
  </label>
  <div class="fuss">
    <span class="status" :class="{ ok: secondsAgo !== null || restored }">{{ status }}</span>
    <button class="btn leise" @click="clear()">Entwurf löschen</button>
  </div>
  <p class="hinweis">Tippen, Seite neu laden (Cmd + R) – alles ist noch da.</p>
</template>

<style scoped>
.frage {
  margin: 0;
  font-weight: 600;
  color: var(--text-h);
}
.sterne {
  display: flex;
  gap: 6px;
}
.stern {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: transparent;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: var(--border);
  transition: color 0.15s, transform 0.1s;
}
.stern.an {
  color: #e3a93b;
}
.stern:active {
  transform: scale(0.92);
}
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
}
textarea {
  font: inherit;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  resize: vertical;
}
.fuss {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.status {
  font-size: 0.85rem;
  font-weight: 600;
}
.status.ok {
  color: var(--accent);
}
</style>
