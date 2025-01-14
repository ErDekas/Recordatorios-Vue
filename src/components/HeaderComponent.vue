<template>
  <div class="header">
    <h1>Proyecto Vue.js {{ userName }}</h1>
    <button @click="$emit('logout')" class="logout-btn">Cerrar sesión</button>
  </div>
</template>

<script>
import { getAuth } from "firebase/auth";

export default {
  name: 'HeaderComponent',
  emits: ['logout'],
  data() {
    return {
      userName: ''
    };
  },
  async created() {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.userName = user.displayName;
      }
    });
  }
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
