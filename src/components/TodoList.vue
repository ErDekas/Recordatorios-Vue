<template>
  <div id="todo-list">
    <TodoItem
      v-for="(todo, index) in todos"
      :key="index"
      :todo="todo"
      @toggle-complete="$emit('toggle-complete', todo)"
      @change-priority="$emit('change-priority', todo)"
      @delete-todo="$emit('delete-todo', todo)"
    />
  </div>
</template>

<script>
import TodoItem from './TodoItem.vue'

export default {
  name: 'TodoList',
  components: {
    TodoItem,
  },
  props: {
    todos: {
      type: Array,
      required: true,
    },
  },
  emits: ['toggle-complete', 'change-priority', 'delete-todo'],
}
</script>
