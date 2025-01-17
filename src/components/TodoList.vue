<template>
  <div class="todo-list">
    <TransitionGroup name="list" tag="div">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle-complete="$emit('toggle-complete', todo)"
        @change-priority="$emit('change-priority', todo)"
        @delete-todo="$emit('delete-todo', todo)"
      />
    </TransitionGroup>
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
<style scoped>
.todo-list {
  position: relative;
}

.list-move, 
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
}
</style>