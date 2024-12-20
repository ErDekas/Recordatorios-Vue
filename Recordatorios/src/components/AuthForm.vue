<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2 class="auth-title">{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</h2>

      <!-- Botones de redes sociales -->
      <div class="social-buttons">
        <button @click="signInWithGoogle" class="social-button google-button">
          <img src="https://www.google.com/favicon.ico" alt="Google" class="social-icon" />
          Continuar con Google
        </button>

        <button @click="signInWithFacebook" class="social-button facebook-button">
          <img src="https://www.facebook.com/favicon.ico" alt="Facebook" class="social-icon" />
          Continuar con Facebook
        </button>

        <button @click="signInWithGithub" class="social-button github-button">
          <img src="https://github.com/favicon.ico" alt="GitHub" class="social-icon" />
          Continuar con GitHub
        </button>
      </div>

      <div class="divider">
        <span>o</span>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" placeholder="nombre@ejemplo.com" required />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" v-model="password" placeholder="Ingresa tu contraseña" required />
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
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

export default {
  setup() {
    const email = ref('')
    const password = ref('')
    const isLogin = ref(true)
    const error = ref('')

    const signInWithGoogle = async () => {
      try {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
      } catch (err) {
        error.value = err.message
      }
    }

    const signInWithFacebook = async () => {
      try {
        const provider = new FacebookAuthProvider()
        provider.addScope('email') // Asegura que estás obteniendo el correo electrónico del usuario
        const result = await signInWithPopup(auth, provider)

        const credential = FacebookAuthProvider.credentialFromResult(result)
        const accessToken = credential.accessToken

        console.log('Inicio de sesión exitoso con Facebook')
        console.log('Token:', accessToken)
        console.log('Usuario:', result.user)
      } catch (err) {
        console.error('Error en el login con Facebook:', err)
        error.value = err.message
      }
    }

    const signInWithGithub = async () => {
      try {
        const provider = new GithubAuthProvider()
        await signInWithPopup(auth, provider)
      } catch (err) {
        error.value = err.message
      }
    }

    const handleSubmit = async () => {
      error.value = ''
      try {
        if (isLogin.value) {
          await signInWithEmailAndPassword(auth, email.value, password.value)
        } else {
          await createUserWithEmailAndPassword(auth, email.value, password.value)
        }
      } catch (err) {
        error.value = err.message
      }
    }

    return {
      email,
      password,
      isLogin,
      handleSubmit,
      signInWithGoogle,
      signInWithFacebook,
      signInWithGithub,
      error,
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
  background-color: #f8fafc;
  padding: 1rem;
}

.auth-box {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 400px;
}

.auth-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.google-button {
  background-color: white;
  color: #1a1a1a;
  border: 1px solid #e2e8f0;
}

.google-button:hover {
  background-color: #f8fafc;
}

.facebook-button {
  background-color: #1877f2;
  color: white;
  border: none;
}

.facebook-button:hover {
  background-color: #166fe5;
}

.github-button {
  background-color: #24292e;
  color: white;
  border: none;
}

.github-button:hover {
  background-color: #1b1f23;
}

.social-icon {
  width: 18px;
  height: 18px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.auth-button:hover {
  background-color: #4338ca;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.toggle-auth {
  margin-top: 1.5rem;
  text-align: center;
  color: #64748b;
}

.toggle-auth span {
  color: #4f46e5;
  cursor: pointer;
  margin-left: 0.5rem;
  font-weight: 500;
}

.toggle-auth span:hover {
  text-decoration: underline;
}
</style>
