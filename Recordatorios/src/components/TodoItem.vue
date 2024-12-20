<template>
  <div class="todo-item" :class="{ completed: todo.completed }">
    <input
      type="checkbox"
      class="todo-checkbox"
      :checked="todo.completed"
      @change="handleToggleComplete"
    />
    <span class="todo-text">
      <button
        class="priority-btn"
        :class="`priority-${todo.priority}`"
        @click="handlePriorityChange"
      >
        {{ capitalizedPriority }}
      </button>
      {{ todo.text }}
      <span class="timestamp">{{ timeAgo }}</span>
    </span>
    <button class="delete-btn" @click="handleDelete">✕</button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { auth, db } from '../firebase' // Asegúrate de que esta ruta es correcta
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'

export default {
  props: {
    todo: {
      type: Object,
      required: true,
    },
    collectionName: {
      type: String,
      default: 'todos',
    },
  },

  setup(props, { emit }) {
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

    // Manejadores de eventos con autenticación y Firestore
    const handleToggleComplete = async () => {
      if (!auth.currentUser) {
        console.error('Usuario no autenticado')
        return
      }

      try {
        const todoRef = doc(db, props.collectionName, props.todo.id)
        await updateDoc(todoRef, {
          completed: !props.todo.completed,
          updatedAt: new Date(),
        })
        emit('toggle-complete')
      } catch (error) {
        console.error('Error al actualizar el todo:', error)
      }
    }

    const handlePriorityChange = async () => {
      if (!auth.currentUser) {
        console.error('Usuario no autenticado')
        return
      }

      const priorities = ['low', 'medium', 'high']
      const currentIndex = priorities.indexOf(props.todo.priority)
      const nextPriority = priorities[(currentIndex + 1) % priorities.length]

      try {
        const todoRef = doc(db, props.collectionName, props.todo.id)
        await updateDoc(todoRef, {
          priority: nextPriority,
          updatedAt: new Date(),
        })
        emit('change-priority', nextPriority)
      } catch (error) {
        console.error('Error al cambiar la prioridad:', error)
      }
    }

    const handleDelete = async () => {
      if (!auth.currentUser) {
        console.error('Usuario no autenticado')
        return
      }

      try {
        const todoRef = doc(db, props.collectionName, props.todo.id)
        await deleteDoc(todoRef)
        emit('delete-todo')
      } catch (error) {
        console.error('Error al eliminar el todo:', error)
      }
    }

    return {
      timeAgo,
      capitalizedPriority,
      handleToggleComplete,
      handlePriorityChange,
      handleDelete,
    }
  },
}
</script>
