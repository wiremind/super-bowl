import Vue from 'vue';
import Vuex from 'vuex';
import api from '@/api';

Vue.use(Vuex);
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    messages: [],
    refreshInterval: 30,
    isLoading: false,
    intervalId: null
  },
  mutations: {
    setRefreshInterval(state, interval) {
      state.refreshInterval = interval;
    },
    setIntervalId(state, intervalId) {
      state.intervalId = intervalId;
    },
    setLoading(state, loading) {
      state.isLoading = loading;
    },
    setMessages(state, messages) {
      state.messages = messages;
    },
    clearIntervalTimeOut(state) {
      clearInterval(state.intervalId);
    }
  },
  actions: {
    getMessages(context) {
      context.commit('setLoading', true);

      api.getMessages().then(messages => {
        setTimeout(() => {
          context.commit('setLoading', false);
        }, 500);
        context.commit('setMessages', messages);
      });
    },
    cancelMessage(context, messageId) {
      return api.cancelMessage(messageId);
    },
    startUpdateMessages(context) {
      const intervalId = setInterval(() => {
        context.dispatch('getMessages');
      }, context.state.refreshInterval * 1000);
      context.commit('setIntervalId', intervalId);
    },
    updateRefreshInterval(context, intervalId) {
      context.commit('clearIntervalTimeOut');
      context.commit('setRefreshInterval', intervalId);
      if (context.state.intervalId) {
        context.dispatch('startUpdateMessages');
      }
    }
  }
});
export default store;
