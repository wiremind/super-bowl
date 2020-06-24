import Vue from 'vue';
import Vuex from 'vuex';
import api from '@/api';
import utils from '@/utils';

Vue.use(Vuex);
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    messages: [],
    jobs: [],
    actors: [],
    refreshInterval: 30,
    sizePage: 50,
    countMessages: null,
    isLoading: false,
    intervalId: null,
    sortedColumn: null,
    sortDirection: null,
    filter: null,
    currentPage: 0
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
    setCountMessages(state, count) {
      state.countMessages = count;
    },
    setActors(state, actors) {
      state.actors = actors;
    },
    setPageSize(state, sizePage) {
      state.sizePage = sizePage;
    },
    clearIntervalTimeOut(state) {
      clearInterval(state.intervalId);
    },
    setJobs(state, jobs) {
      state.jobs = jobs;
    },
    setFilter(state, filter) {
      state.filter = filter;
    },
    setSortDirection(state, direction) {
      state.sortDirection = direction;
    },
    setCurrentPage(state, currentPage) {
      state.currentPage = currentPage;
    },
    setSortedColumn(state, column) {
      state.sortedColumn = column;
    }
  },
  getters: {
    actorsByName: state => Object.entries(state.actors.map(a => [a.actorName, a]))
  },
  actions: {
    getMessages(context) {
      context.commit('setLoading', true);
      const args = {
        size: context.state.sizePage,
        search_value: context.state.filter,
        sort_column: context.state.sortedColumn
          ? utils.camelCaseToUnderScore(context.state.sortedColumn)
          : null,
        sort_direction: context.state.sortDirection,
        offset: context.state.currentPage * context.state.sizePage
      };
      api.getMessages(args).then(messages => {
        setTimeout(() => {
          context.commit('setLoading', false);
        }, 500);
        context.commit('setCountMessages', messages.count);
        context.commit('setMessages', messages.data);
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
    },
    updateSizePage(context, sizePage) {
      context.commit('setPageSize', sizePage);
      context.commit('setCurrentPage', 0);
      context.dispatch('getMessages');
    },
    updateFilter(context, filter) {
      context.commit('setFilter', filter);
      context.commit('setCurrentPage', 0);
      context.dispatch('getMessages');
    },
    updateCurrentPage(context, currentPage) {
      context.commit('setCurrentPage', currentPage);
      context.dispatch('getMessages');
    },
    updateSortDirection(context, direction) {
      context.commit('setSortDirection', direction);
      context.dispatch('getMessages');
    },
    updateSortedColumn(context, column) {
      context.commit('setSortedColumn', column);
    }
  }
});
export default store;
