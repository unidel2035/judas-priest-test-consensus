<template>
  <div class="todo-list">
    <h2>Todo List</h2>

    <div class="add-todo">
      <input
        v-model="newTodo"
        @keyup.enter="addTodo"
        placeholder="Add a new todo..."
        class="todo-input"
      >
      <button @click="addTodo" class="add-button">Add</button>
    </div>

    <ul class="todos">
      <li v-for="(todo, index) in todos" :key="index" class="todo-item">
        <span
          :class="{ 'completed': todo.completed }"
          @click="toggleTodo(index)"
          class="todo-text"
        >
          {{ todo.text }}
        </span>
        <button @click="removeTodo(index)" class="delete-button">Delete</button>
      </li>
    </ul>

    <div class="stats">
      <p>Total: {{ todos.length }} | Completed: {{ completedCount }} | Pending: {{ pendingCount }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoList',
  data() {
    return {
      newTodo: '',
      todos: []
    }
  },
  computed: {
    completedCount() {
      return this.todos.filter(todo => todo.completed).length
    },
    pendingCount() {
      return this.todos.filter(todo => !todo.completed).length
    }
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({
          text: this.newTodo.trim(),
          completed: false
        })
        this.newTodo = ''
      }
    },
    removeTodo(index) {
      this.todos.splice(index, 1)
    },
    toggleTodo(index) {
      this.todos[index].completed = !this.todos[index].completed
    }
  }
}
</script>

<style scoped>
.todo-list {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 500px;
}

.add-todo {
  display: flex;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.add-button {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
}

.add-button:hover {
  background: #369870;
}

.todos {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #42b883;
}

.todo-text {
  flex: 1;
  cursor: pointer;
  text-align: left;
}

.todo-text.completed {
  text-decoration: line-through;
  color: #888;
}

.delete-button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-button:hover {
  background: #ff5252;
}

.stats {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  font-size: 14px;
  color: #666;
}
</style>