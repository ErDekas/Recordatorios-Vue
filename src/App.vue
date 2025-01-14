<template>
  <router-view />
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        router.push('/dashboard') // Redirige al dashboard.
      } else {
        localStorage.removeItem('user')
        router.push('/login') // Redirige al login.
      }
    })
  },
}
</script>
