<template>
  <div class="todo-item" :class="{ completed: todo.completed }">
    <input
      type="checkbox"
      class="todo-checkbox"
      :checked="todo.completed"
      @change="$emit('toggle-complete')"
    />
    <span class="todo-text">
      <button
        class="priority-btn"
        :class="`priority-${todo.priority}`"
        @click="$emit('change-priority')"
      >
        {{ capitalizedPriority }}
      </button>
      {{ todo.text }}
      <span class="timestamp">{{ timeAgo }}</span>
    </span>
    <button class="delete-btn" @click="$emit('delete-todo')">✕</button>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    todo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const timeAgo = computed(() => {
      const seconds = Math.floor((new Date() - props.todo.timestamp) / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `Añadido hace ${days} días`
      if (hours > 0) return `Añadido hace ${hours} horas`
      if (minutes > 0) return `Añadido hace ${minutes} minutos`
      return 'Añadido hace un momento'
    })

    const capitalizedPriority = computed(
      () => props.todo.priority.charAt(0).toUpperCase() + props.todo.priority.slice(1),
    )

    return {
      timeAgo,
      capitalizedPriority,
    }
  },
}
</script>
