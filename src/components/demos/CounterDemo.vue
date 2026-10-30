<script setup lang="ts">
import { ref } from 'vue'
import { useTitle } from '@vueuse/core'
import { useCounter } from '../../composables/useCounter'

const max = ref(10)
// Eigenes Composable – Option "max" ist ein Ref und bleibt reaktiv
const { count, inc, dec, reset, isMin, isMax } = useCounter(0, { min: 0, max })

// Live-Coding-Stelle: eigenes Composable mit VueUse kombinieren
useTitle(() => `Zähler: ${count.value}`)
</script>

<template>
  <div class="zaehler">
    <button class="btn rund" :disabled="isMin" @click="dec()">−</button>
    <strong>{{ count }}</strong>
    <button class="btn rund" :disabled="isMax" @click="inc()">+</button>
  </div>
  <label>
    Maximum: {{ max }}
    <input v-model.number="max" type="range" min="1" max="20" />
  </label>
  <button class="btn leise" @click="reset()">Zurücksetzen</button>
  <p class="hinweis">Der Browser-Tab-Titel zählt mit (useTitle).</p>
</template>

<style scoped>
.zaehler {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
strong {
  font-size: 2.6rem;
  min-width: 2ch;
  text-align: center;
  color: var(--text-h);
  font-family: var(--mono);
}
.rund {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.4rem;
  padding: 0;
}
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
}
</style>
