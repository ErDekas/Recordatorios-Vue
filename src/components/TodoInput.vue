<template>
  <div class="input-container">
    <input
      type="text"
      v-model="todoText"
      placeholder="¿Qué quieres recordar?"
      @keyup.enter="handleSubmit"
    />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TodoInput',
  emits: ['add-todo'],
  setup(props, { emit }) {
    const todoText = ref('')

    const handleSubmit = () => {
      if (todoText.value.trim() !== '') {
        emit('add-todo', todoText.value)
        todoText.value = ''
      }
    }

    return {
      todoText,
      handleSubmit,
    }
  },
}
</script>
