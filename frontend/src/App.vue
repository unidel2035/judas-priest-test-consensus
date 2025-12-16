<template>
  <div id="app">
    <div class="chat-container">
      <header class="chat-header">
        <h1>💬 Чат</h1>
        <div class="connection-status">
          <span :class="['status-indicator', connectionStatus]"></span>
          {{ connectionStatusText }}
        </div>
      </header>

      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0" class="no-messages">
          Сообщений пока нет. Начните общение!
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message', { 'own-message': msg.username === username }]"
        >
          <div class="message-header">
            <span class="username">{{ msg.username }}</span>
            <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <div class="message-text">{{ msg.message }}</div>
        </div>
      </div>

      <div class="input-container">
        <input
          v-model="username"
          type="text"
          placeholder="Ваше имя"
          class="username-input"
          maxlength="20"
        />
        <div class="message-input-wrapper">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Введите сообщение..."
            class="message-input"
            :disabled="!connected"
          />
          <button
            @click="sendMessage"
            class="send-button"
            :disabled="!connected || !newMessage.trim() || !username.trim()"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      ws: null,
      connected: false,
      messages: [],
      newMessage: '',
      username: 'Гость',
      wsUrl: 'ws://localhost:3000'
    }
  },
  computed: {
    connectionStatus() {
      return this.connected ? 'connected' : 'disconnected';
    },
    connectionStatusText() {
      return this.connected ? 'Подключено' : 'Отключено';
    }
  },
  mounted() {
    this.connectWebSocket();
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  },
  methods: {
    connectWebSocket() {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.connected = true;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'history') {
          this.messages = data.messages;
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else if (data.type === 'message') {
          this.messages.push(data.message);
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          this.connectWebSocket();
        }, 3000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    },
    sendMessage() {
      if (!this.newMessage.trim() || !this.username.trim() || !this.connected) {
        return;
      }

      const message = {
        username: this.username.trim(),
        message: this.newMessage.trim()
      };

      this.ws.send(JSON.stringify(message));
      this.newMessage = '';
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#app {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.chat-container {
  width: 100%;
  max-width: 800px;
  height: 90vh;
  max-height: 800px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h1 {
  font-size: 24px;
  font-weight: 600;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff4444;
}

.status-indicator.connected {
  background: #44ff44;
  box-shadow: 0 0 10px #44ff44;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
}

.no-messages {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 16px;
}

.message {
  margin-bottom: 16px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-weight: 600;
  color: #667eea;
  font-size: 14px;
}

.own-message .username {
  color: #764ba2;
}

.timestamp {
  font-size: 12px;
  color: #999;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  max-width: 80%;
}

.own-message .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-left: auto;
}

.input-container {
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.username-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 10px;
  transition: border-color 0.3s;
}

.username-input:focus {
  outline: none;
  border-color: #667eea;
}

.message-input-wrapper {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
}

.message-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar styling */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
