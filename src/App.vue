<template>
  <main>
    <c-header />
    <c-table :messages="messages" />
  </main>
</template>

<script>
import CHeader from '@/components/CHeader';
import CTable from '@/components/CTable';
import api from '@/api';
export default {
  name: 'App',
  components: { CHeader, CTable },

  data() {
    return {
      messages: []
    };
  },

  methods: {
    updateMessages() {
      api.getMessages().then(messages => (this.messages = messages));
    }
  },

  created() {
    this.updateMessages();
    setInterval(() => {
      this.updateMessages();
    }, 10000);
  }
};
</script>
