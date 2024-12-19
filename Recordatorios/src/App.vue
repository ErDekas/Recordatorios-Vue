<template>
  <div>
    <AuthForm v-if="!user" />

    <div v-else class="container">
      <div class="header">
        <h1>Proyecto Vue.js - Pablo Linares</h1>
        <button @click="handleLogout" class="logout-btn">Cerrar sesión</button>
      </div>

      <div class="input-container">
        <input
          type="text"
          v-model="newTodo"
          placeholder="¿Qué quieres recordar?"
          @keyup.enter="addTodo"
        />
      </div>

      <div class="stats">
        <span>{{ pendingCount }} Tareas pendientes de un total de {{ todos.length }}</span>
        <span class="clear-completed" @click="clearCompleted">✕ Borrar tareas completadas</span>
      </div>

      <div id="todo-list">
        <TodoItem
          v-for="(todo, index) in sortedTodos"
          :key="index"
          :todo="todo"
          @toggle-complete="toggleComplete(todo)"
          @change-priority="changePriority(todo)"
          @delete-todo="deleteTodo(todo)"
        />
      </div>

      <div class="footer">
        Desarrollado por "Pablo Linares".<br />
        Código disponible en
        <a href="https://github.com/ErDekas/Recordatorio" target="_blank">GitHub</a>.
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import TodoItem from './components/TodoItem.vue'
import AuthForm from './components/AuthForm.vue'

export default {
  components: {
    TodoItem,
    AuthForm,
  },
  setup() {
    const user = ref(null)
    const todos = ref([])
    const newTodo = ref('')

    // Auth state observer
    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
        if (currentUser) {
          loadTodos()
        }
      })
    })

    const handleLogout = async () => {
      try {
        await auth.signOut()
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      }
    }

    // Firestore operations
    const loadTodos = async () => {
      if (!user.value) return

      const q = query(collection(db, 'todos'), where('userId', '==', user.value.uid))

      try {
        const querySnapshot = await getDocs(q)
        todos.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      } catch (error) {
        console.error('Error al cargar todos:', error)
      }
    }

    const addTodo = async () => {
      if (newTodo.value.trim() === '' || !user.value) return

      try {
        const todoRef = await addDoc(collection(db, 'todos'), {
          text: newTodo.value,
          completed: false,
          priority: 'normal',
          timestamp: new Date().getTime(),
          userId: user.value.uid,
        })

        todos.value.push({
          id: todoRef.id,
          text: newTodo.value,
          completed: false,
          priority: 'normal',
          timestamp: new Date().getTime(),
        })

        newTodo.value = ''
      } catch (error) {
        console.error('Error al añadir todo:', error)
      }
    }

    const toggleComplete = async (todo) => {
      try {
        await updateDoc(doc(db, 'todos', todo.id), {
          completed: !todo.completed,
        })
        todo.completed = !todo.completed
      } catch (error) {
        console.error('Error al actualizar todo:', error)
      }
    }

    const changePriority = async (todo) => {
      const priorities = ['low', 'normal', 'high']
      const currentIndex = priorities.indexOf(todo.priority)
      const newPriority = priorities[(currentIndex + 1) % priorities.length]

      try {
        await updateDoc(doc(db, 'todos', todo.id), {
          priority: newPriority,
        })
        todo.priority = newPriority
      } catch (error) {
        console.error('Error al cambiar prioridad:', error)
      }
    }

    const deleteTodo = async (todoToDelete) => {
      try {
        await deleteDoc(doc(db, 'todos', todoToDelete.id))
        todos.value = todos.value.filter((todo) => todo.id !== todoToDelete.id)
      } catch (error) {
        console.error('Error al eliminar todo:', error)
      }
    }

    const clearCompleted = async () => {
      const completedTodos = todos.value.filter((todo) => todo.completed)

      try {
        await Promise.all(completedTodos.map((todo) => deleteDoc(doc(db, 'todos', todo.id))))
        todos.value = todos.value.filter((todo) => !todo.completed)
      } catch (error) {
        console.error('Error al limpiar todos completados:', error)
      }
    }

    const pendingCount = computed(() => todos.value.filter((todo) => !todo.completed).length)

    const sortedTodos = computed(() => {
      const priorityOrder = { high: 0, normal: 1, low: 2 }
      return [...todos.value].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    })

    return {
      user,
      todos,
      newTodo,
      addTodo,
      toggleComplete,
      changePriority,
      deleteTodo,
      clearCompleted,
      pendingCount,
      sortedTodos,
      handleLogout,
    }
  },
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
