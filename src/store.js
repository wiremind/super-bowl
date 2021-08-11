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
    options: [],
    groups: [],
    refreshInterval: 30,
    sizePage: 50,
    countMessages: null,
    countGroups: null,
    isLoading: false,
    intervalId: null,
    sortedColumn: null,
    sortDirection: null,
    filter: null,
    currentPage: 0,
    currentPath: null
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
    setCountGroups(state, count) {
      state.countGroups = count;
    },
    setActors(state, actors) {
      state.actors = actors;
    },
    setOptions(state, options) {
      state.options = options;
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
    setGroups(state, groups) {
      state.groups = groups;
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
    },
    setCurrentPath(state, path) {
      state.currentPath = path;
    },
    resetAttributesPage(state) {
      state.filter = null;
      state.sortedColumn = null;
      state.sortDirection = null;
      state.currentPage = 0;
    }
  },
  getters: {
    actorsByName: state => Object.fromEntries(state.actors.map(a => [a.name, a])),
    args: state => {
      return {
        size: state.sizePage,
        search_value: state.filter,
        sort_column: state.sortedColumn ? utils.camelCaseToUnderScore(state.sortedColumn) : null,
        sort_direction: state.sortDirection,
        offset: state.currentPage * state.sizePage
      };
    }
  },
  actions: {
    getMessages(context) {
      context.commit('setLoading', true);
      api.getMessages(context.getters.args).then(messages => {
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
    getOptions(context) {
      api.getOptions().then(options => context.commit('setOptions', options));
    },
    getGroups(context) {
      context.commit('setLoading', true);
      api.getGroups(context.getters.args).then(groups => {
        setTimeout(() => {
          context.commit('setLoading', false);
        }, 500);
        context.commit('setCountGroups', groups.count);
        context.commit('setGroups', groups.data);
      });
    },
    cancelMessage(context, messageId) {
      return api.cancelMessage(messageId);
    },
    requeueMessage(context, messageId) {
      return api.requeue(messageId);
    },
    enqueueMessage(context, message) {
      return api.enqueueMessage(message);
    },
    refresh(context) {
      if (context.state.currentPath === '/') {
        context.dispatch('getActors');
        context.dispatch('getMessages');
      } else if (context.state.currentPath === '/groups') {
        context.dispatch('getGroups');
      }
    },
    startRefresh(context) {
      context.dispatch('refresh');
      const intervalId = setInterval(() => {
        if (!context.state.isLoading) {
          context.dispatch('refresh');
        }
      }, context.state.refreshInterval * 1000);
      context.commit('setIntervalId', intervalId);
    },
    updateRefreshInterval(context, intervalId) {
      context.commit('clearIntervalTimeOut');
      context.commit('setRefreshInterval', intervalId);
      if (context.state.intervalId && intervalId != null) {
        context.dispatch('startRefresh');
      }
    },
    updateSizePage(context, sizePage) {
      context.commit('setPageSize', sizePage);
      context.commit('setCurrentPage', 0);
      context.dispatch('refresh');
    },
    updateFilter(context, filter) {
      context.commit('setFilter', filter);
      context.commit('setCurrentPage', 0);
      context.dispatch('refresh');
    },
    updateCurrentPage(context, currentPage) {
      context.commit('setCurrentPage', currentPage);
      context.dispatch('refresh');
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
