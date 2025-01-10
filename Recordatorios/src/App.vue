<template>
  <div>
    <AuthForm v-if="!user" />

    <div v-else class="container">
      <HeaderComponent @logout="handleLogout" />

      <TodoInput @add-todo="addTodo" />

      <TodoStats 
        :pending-count="pendingCount"
        :total-count="todos.length"
        @clear-completed="clearCompleted"
      />

      <TodoList
        :todos="sortedTodos"
        @toggle-complete="toggleComplete"
        @change-priority="changePriority"
        @delete-todo="deleteTodo"
      />

      <FooterComponent />
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
import AuthForm from './components/AuthForm.vue'
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import TodoInput from './components/TodoInput.vue'
import TodoStats from './components/TodoStats.vue'
import TodoList from './components/TodoList.vue'

export default {
  components: {
    AuthForm,
    HeaderComponent,
    FooterComponent,
    TodoInput,
    TodoStats,
    TodoList,
  },
  setup() {
    const user = ref(null)
    const todos = ref([])

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

    const addTodo = async (text) => {
      if (!user.value) return

      try {
        const todoRef = await addDoc(collection(db, 'todos'), {
          text,
          completed: false,
          priority: 'normal',
          timestamp: new Date().getTime(),
          userId: user.value.uid,
        })

        todos.value.push({
          id: todoRef.id,
          text,
          completed: false,
          priority: 'normal',
          timestamp: new Date().getTime(),
        })
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