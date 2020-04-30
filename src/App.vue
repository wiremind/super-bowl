<template>
  <main>
    <c-header
      @onUpdateMessages="updateMessages"
      @onUpdateRefreshInterval="updateRefreshInterval"
      :refreshInterval="refreshInterval"
    />
    <c-table :messages="messages" class="pt-32">
      <div class="loader" v-if="isLoading">Loading...</div>
    </c-table>
  </main>
</template>

<script>
import CHeader from '@/components/CHeader';
import CTable from '@/components/CTable';
import api from '@/api';
require('@/assets/css/spinner.css');
export default {
  name: 'App',
  components: { CHeader, CTable },

  data() {
    return {
      intervalId: null,
      isLoading: false,
      messages: [],
      refreshInterval: 30
    };
  },

  methods: {
    startUpdateMessages() {
      this.intervalId = setInterval(() => {
        this.updateMessages();
      }, this.refreshInterval * 1000);
    },
    updateMessages() {
      this.isLoading = true;
      api.getMessages().then(messages => {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
        this.messages = messages;
      });
    },
    updateRefreshInterval(newRefreshInterval) {
      this.refreshInterval = newRefreshInterval;
      clearInterval(this.intervalId);
      if (this.refreshInterval) {
        this.startUpdateMessages();
      } else {
        this.isLoading = false;
      }
    }
  },

  created() {
    this.updateMessages();
    this.startUpdateMessages();
  },

  beforeDestroy() {
    clearInterval(this.intervalId);
  }
};
</script>
