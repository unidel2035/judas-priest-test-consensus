<template>
  <div id="app">
    <header>
      <h1>Vue.js Demo Application</h1>
      <p>Welcome to this simple demonstration app</p>
    </header>

    <main>
      <CounterComponent />
      <TodoList />
    </main>
  </div>
</template>

<script>
import CounterComponent from './components/CounterComponent.vue'
import TodoList from './components/TodoList.vue'

export default {
  name: 'App',
  components: {
    CounterComponent,
    TodoList
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

header {
  margin-bottom: 40px;
}

h1 {
  color: #42b883;
  margin-bottom: 10px;
}
</style>