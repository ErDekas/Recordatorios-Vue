<template>
  <Transition name="fade">
    <div 
      class="todo-item" 
      :class="{ completed: todo.completed }" 
      v-show="!isDeleting"
      :key="todo.id"
    >
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
        <span class="timestamp">{{ formattedTimeAgo }}</span>
      </span>
      <button class="delete-btn" @click="handleDelete">✕</button>
    </div>
  </Transition>
</template>

<script>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../firebase'
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'

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
    const isDeleting = ref(false)
    const currentTime = ref(new Date())
    let timeInterval

    // Función para calcular el tiempo transcurrido
    const calculateTimeAgo = (timestamp) => {
      const seconds = Math.floor((currentTime.value - timestamp) / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `Añadido hace ${days} días`
      if (hours > 0) return `Añadido hace ${hours} horas`
      if (minutes > 0) return `Añadido hace ${minutes} minutos`
      return 'Añadido hace un momento'
    }

    // Computed property para el tiempo formateado
    const formattedTimeAgo = computed(() => {
      return calculateTimeAgo(props.todo.timestamp)
    })

    // Watcher para actualizar la base de datos cuando cambia el timestamp
    watch(() => props.todo.timestamp, async (newTimestamp, oldTimestamp) => {
      if (newTimestamp !== oldTimestamp && auth.currentUser) {
        try {
          const todoRef = doc(db, props.collectionName, props.todo.id)
          await updateDoc(todoRef, {
            timestamp: newTimestamp,
            updatedAt: new Date(),
          })
        } catch (error) {
          console.error('Error al actualizar el timestamp:', error)
        }
      }
    })

    // Actualizar el tiempo actual cada minuto
    onMounted(() => {
      timeInterval = setInterval(() => {
        currentTime.value = new Date()
      }, 60000) // Actualizar cada minuto
    })

    // Limpiar el intervalo cuando el componente se desmonta
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    const capitalizedPriority = computed(
      () => props.todo.priority.charAt(0).toUpperCase() + props.todo.priority.slice(1)
    )

    const handleToggleComplete = async () => {
      if (!auth.currentUser) {
        console.error('Usuario no autenticado')
        return
      }

      try {
        const todoRef = doc(db, props.collectionName, props.todo.id)
        const docSnap = await getDoc(todoRef)

        if (!docSnap.exists()) {
          console.error('El documento no existe:', props.todo.id)
          return
        }

        await updateDoc(todoRef, {
          completed: !props.todo.completed,
          updatedAt: new Date().getTime(),
          timestamp: new Date() // Actualizar timestamp al completar
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
          timestamp: new Date() // Actualizar timestamp al cambiar prioridad
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
        isDeleting.value = true
        
        // Esperamos a que termine la transición antes de eliminar
        await new Promise(resolve => {
          setTimeout(async () => {
            const todoRef = doc(db, props.collectionName, props.todo.id)
            await deleteDoc(todoRef)
            emit('delete-todo', props.todo)
            resolve()
          }, 500)
        })
      } catch (error) {
        console.error('Error al eliminar el todo:', error)
        isDeleting.value = false
      }
    }

    return {
      formattedTimeAgo,
      capitalizedPriority,
      handleToggleComplete,
      handlePriorityChange,
      handleDelete,
      isDeleting,
    }
  },
}
</script>
<style scoped>
.todo-item {
  position: relative;
  /* Resto de tus estilos actuales */
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>