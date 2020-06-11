import Vue from 'vue';
import Vuex from 'vuex';
import api from '@/api';

Vue.use(Vuex);
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    messages: [],
    jobs: [],
    actors: {},
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
    setActors(state, actors) {
      state.actors = actors;
    },
    clearIntervalTimeOut(state) {
      clearInterval(state.intervalId);
    },
    setJobs(state, jobs) {
      state.jobs = jobs;
    }
  },
  getters: {
    getActorByName: state => name => {
      return state.actors[name];
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
    getActors(context) {
      api.getActors().then(actors => context.commit('setActors', actors));
    },
    getJobs(context) {
      context.commit('setLoading', true);
      api.getJobs().then(jobs => {
        setTimeout(() => {
          context.commit('setLoading', false);
        }, 500);
        context.commit('setJobs', jobs);
      });
    },
    cancelMessage(context, messageId) {
      return api.cancelMessage(messageId);
    },
    enqueueMessage(context, message) {
      return api.enqueueMessage(message);
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
