<script setup lang="ts">
// Wiederverwendbarer Rahmen für jede Demo (Props + Slot)
defineProps<{
  nummer: number
  titel: string
  composables: string[]
}>()
</script>

<template>
  <section class="card">
    <header class="card-head">
      <span class="nummer">{{ nummer }}</span>
      <h2>{{ titel }}</h2>
    </header>
    <div class="tags">
      <code v-for="c in composables" :key="c" class="tag">{{ c }}</code>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nummer {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
}
h2 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-h);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  font-family: var(--mono);
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--accent-bg);
  color: var(--accent-text);
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
