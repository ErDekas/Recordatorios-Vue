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

      <div class="reminder-input">
        <!-- Input para configurar el recordatorio -->
        <input
          v-if="!todo.reminderTime && !emailSent"
          type="datetime-local"
          v-model="reminderTime"
          @change="setReminder"
        />

        <!-- Campana de recordatorio si ya está configurado el recordatorio -->
        <span v-if="todo.reminderTime && !emailSent" class="reminder-badge">
          🔔 {{ formatReminderTime(todo.reminderTime) }}
        </span>

        <!-- Mensaje cuando el recordatorio se haya enviado -->
        <span v-if="emailSent" class="reminder-sent"> ✅ Recordatorio enviado </span>
      </div>

      <button class="delete-btn" @click="handleDelete">✕</button>
    </div>
  </Transition>
</template>

<script>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../firebase'
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import emailjs from '@emailjs/browser'

const userId = import.meta.env.VITE_EMAILJS_USER_ID;
emailjs.init(userId)

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
    const reminderTime = ref(props.todo.reminderTime || '')
    const emailSent = ref(false)
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_MEAUSEREMENT_ID;
    let timeInterval
    let reminderTimeout

    const formatReminderTime = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }

    const setReminder = async () => {
      if (!auth.currentUser) return

      const selectedTime = new Date(reminderTime.value).getTime()
      const delay = selectedTime - Date.now()

      if (delay > 0) {
        try {
          const todoRef = doc(db, props.collectionName, props.todo.id)
          await updateDoc(todoRef, {
            reminderTime: selectedTime,
          })

          if (reminderTimeout) {
            clearTimeout(reminderTimeout)
          }

          reminderTimeout = setTimeout(() => {
            sendReminderEmail()
          }, delay)
          emailSent.value = false
        } catch (error) {
          console.error('Error al configurar el recordatorio:', error)
        }
      }
    }

    const sendReminderEmail = async () => {
      try {
        const templateParams = {
          to_email: auth.currentUser.email,
          to_name: auth.currentUser.displayName || 'Usuario',
          task_text: props.todo.text,
          due_date: new Date(reminderTime.value).toLocaleString(),
        }

        await emailjs.send(serviceId, templateId, templateParams)

        console.log('Recordatorio enviado correctamente')
        emailSent.value = true
        reminderTime.value = ''
      } catch (error) {
        console.error('Error al enviar el recordatorio:', error)
        emailSent.value = false
      }
    }

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
    watch(
      () => props.todo.timestamp,
      async (newTimestamp, oldTimestamp) => {
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
      },
    )

    // Watcher para actualizar cuando se configure un recordatorio
    watch(reminderTime, (newValue) => {
      if (newValue) {
        setReminder()
      }
    })

    // Actualizar el tiempo actual cada minuto
    onMounted(() => {
      timeInterval = setInterval(() => {
        currentTime.value = new Date()
      }, 60000)

      if (props.todo.reminderTime && props.todo.reminderTime > Date.now()) {
        const delay = props.todo.reminderTime - Date.now()
        reminderTimeout = setTimeout(() => {
          sendReminderEmail()
        }, delay)
      }
    })

    // Limpiar el intervalo cuando el componente se desmonta
    onUnmounted(() => {
      if (timeInterval) clearInterval(timeInterval)
      if (reminderTimeout) clearTimeout(reminderTimeout)
    })

    const capitalizedPriority = computed(
      () => props.todo.priority.charAt(0).toUpperCase() + props.todo.priority.slice(1),
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
          timestamp: new Date(), // Actualizar timestamp al completar
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
          timestamp: new Date(), // Actualizar timestamp al cambiar prioridad
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
        await new Promise((resolve) => {
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
      reminderTime,
      setReminder,
      formatReminderTime,
      emailSent,
    }
  },
}
</script>
<style scoped>
.reminder-input {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2a2a2a;
  margin-right: 70px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #666;
}

.reminder-input input {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #fff;
  color: #000;
  font-size: 14px;
}

.reminder-badge {
  background-color: #4a9eff;
  padding: 0.7rem 1.8rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #fff;
  font-weight: bold;
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

.reminder-sent {
  color: green;
  padding: 0.75rem 1.3rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: bold;
  background-color: #a5f5af;
}
</style>
