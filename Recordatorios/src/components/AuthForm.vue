// src/components/AuthForm.vue
<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Email" required />
        </div>
        <div class="form-group">
          <input type="password" v-model="password" placeholder="Contraseña" required />
        </div>
        <button type="submit" class="auth-button">
          {{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}
        </button>
      </form>
      <p class="toggle-auth">
        {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
        <span @click="isLogin = !isLogin">
          {{ isLogin ? 'Regístrate' : 'Inicia sesión' }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export default {
  setup() {
    const email = ref('')
    const password = ref('')
    const isLogin = ref(true)

    const handleSubmit = async () => {
      try {
        if (isLogin.value) {
          await signInWithEmailAndPassword(auth, email.value, password.value)
        } else {
          await createUserWithEmailAndPassword(auth, email.value, password.value)
        }
      } catch (error) {
        alert(error.message)
      }
    }

    return {
      email,
      password,
      isLogin,
      handleSubmit,
    }
  },
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.toggle-auth {
  margin-top: 1rem;
  text-align: center;
}

.toggle-auth span {
  color: #4caf50;
  cursor: pointer;
  text-decoration: underline;
}
</style>
