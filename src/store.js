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
    selectedActors: null,
    selectedStatuses: ['Started', 'Pending', 'Skipped', 'Canceled', 'Failure', 'Success'],
    selectedId: null,
    selectedType: null,
    startDateTime: null,
    endDateTime: null,
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
    setSelectedActors(state, selectedActors) {
      state.selectedActors = selectedActors;
    },
    setSelectedStatuses(state, selectedStatuses) {
      state.selectedStatuses = selectedStatuses;
    },
    setSelectedType(state, selectedType) {
      state.selectedType = selectedType;
    },
    setSelectedId(state, selectedId) {
      state.selectedId = selectedId;
    },
    setStartDateTime(state, startDateTime) {
      state.startDateTime = startDateTime;
    },
    setEndDateTime(state, endDateTime) {
      state.endDateTime = endDateTime;
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
      state.selectedActors = null;
      state.selectedStatuses = ['Started', 'Pending', 'Skipped', 'Canceled', 'Failure', 'Success'];
      state.selectedId = null;
      state.startDateTime = null;
      state.endDateTime = null;
      state.sortedColumn = null;
      state.sortDirection = null;
      state.currentPage = 0;
    }
  },
  getters: {
    args: state => {
      return {
        size: state.sizePage,
        sort_column: state.sortedColumn ? utils.camelCaseToUnderScore(state.sortedColumn) : null,
        sort_direction: state.sortDirection,
        selected_actors: state.selectedActors,
        selected_statuses: state.selectedStatuses,
        selected_ids:
          state.selectedId !== '' && state.selectedId != null ? [state.selectedId] : null,
        start_datetime: state.startDateTime,
        end_datetime: state.endDateTime,
        offset: state.currentPage * state.sizePage,
        selected_type: state.selectedType
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
    updateSelectedActors(context, selectedActors) {
      context.commit('setSelectedActors', selectedActors);
      context.commit('setCurrentPage', 0);
      context.dispatch('refresh');
    },
    updateSelectedStatuses(context, selectedStatuses) {
      context.commit('setSelectedStatuses', selectedStatuses);
      context.commit('setCurrentPage', 0);
      context.dispatch('refresh');
    },
    updateSelectedId(context, selectedId) {
      context.commit('setSelectedId', selectedId);
      context.commit('setCurrentPage', 0);
      context.dispatch('refresh');
    },
    updateStartDateTime(context, startDateTime) {
      context.commit('setStartDateTime', startDateTime);
      context.commit('setCurrentPage', 0);
      context.dispatch('refresh');
    },
    updateEndDateTime(context, endDateTime) {
      context.commit('setEndDateTime', endDateTime);
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
    },
    updateSelectedType(context, types) {
      context.commit('setSelectedType', types);
      context.commit('setCurrentPage', 0);
      context.dispatch('refresh');
    },
    cleanStates(context, minDateTime) {
      const interval = Math.round(
        new Date(Date.now()).getTime() - new Date(minDateTime).getTime() / 1000
      );
      const args = { max_age: interval };
      api.cleanStates(args).then(() => this.updateCurrentPage());
    }
  }
});
export default store;
