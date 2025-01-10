<template>
  <div class="stats">
    <span>{{ pendingCount }} Tareas pendientes de un total de {{ totalCount }}</span>
    <span class="clear-completed" @click="$emit('clear-completed')">
      ✕ Borrar tareas completadas
    </span>
  </div>
</template>

<script>
export default {
  name: 'TodoStats',
  props: {
    pendingCount: {
      type: Number,
      required: true,
    },
    totalCount: {
      type: Number,
      required: true,
    },
  },
  emits: ['clear-completed'],
}
</script>
