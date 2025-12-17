<template>
  <div class="counter">
    <h2>Counter Component</h2>
    <p>Current count: {{ count }}</p>
    <div class="buttons">
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
      <button @click="reset">Reset</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CounterComponent',
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    reset() {
      this.count = 0
    }
  }
}
</script>

<style scoped>
.counter {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 400px;
}

.buttons {
  margin-top: 15px;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 0 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #369870;
}
</style>