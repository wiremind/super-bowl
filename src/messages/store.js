import utils from '@/messages/utils';
import api from '@/messages/api';

const moduleMessages = {
  state: {
    messages: [],
    sizePage: 50,
    countMessages: null,
    sortedColumn: null,
    sortDirection: null,
    selectedStatuses: ['Started', 'Pending', 'Skipped', 'Canceled', 'Failure', 'Success'],
    selectedActors: null,
    selectedId: null,
    startDateTime: null,
    endDateTime: null,
    currentPage: 0,
    loadDateTime: null
  },
  mutations: {
    setMessages(state, messages) {
      state.messages = messages;
    },
    setCountMessages(state, count) {
      state.countMessages = count;
    },
    setPageSize(state, sizePage) {
      state.sizePage = sizePage;
    },
    setSelectedActors(state, selectedActors) {
      state.selectedActors = selectedActors;
    },
    setSelectedStatuses(state, selectedStatuses) {
      state.selectedStatuses = selectedStatuses;
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
    setLoadDateTime(state, loadDateTime) {
      state.loadDateTime = loadDateTime;
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
        offset: state.currentPage * state.sizePage
      };
    }
  },
  actions: {
    getMessages(context) {
      context.commit('setLoading', true);
      api.getMessages(context.getters.args).then(data => {
        context.commit('setLoadDateTime', data.loadDateTime);
        setTimeout(() => {
          context.commit('setLoading', false);
        }, 500);
        context.commit('setCountMessages', data.count);
        context.commit('setMessages', data.messages);
      });
    },
    cancelMessage(context, messageId) {
      return api.cancelMessage(messageId);
    },
    requeueMessage(context, messageId) {
      return api.requeue(messageId);
    },
    refresh(context) {
      if (context.rootState.currentPath === 'messages') {
        context.dispatch('getMessages');
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
    cleanStates(context, minDateTime) {
      const interval = Math.round(
        new Date(Date.now()).getTime() - new Date(minDateTime).getTime() / 1000
      );
      const args = { max_age: interval };
      api.cleanStates(args).then(() => this.updateCurrentPage());
    }
  }
};

export default moduleMessages;
