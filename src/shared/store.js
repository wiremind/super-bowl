import api from '@/shared/api';

const moduleShared = {
  state: {
    actors: [],
    refreshInterval: 30,
    isLoading: false,
    intervalId: null,
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
    setActors(state, actors) {
      state.actors = actors;
    },
    setCurrentPath(state, path) {
      state.currentPath = path;
    },
    clearIntervalTimeOut(state) {
      clearInterval(state.intervalId);
    }
  },
  actions: {
    getActors(context) {
      api.getActors().then(actors => context.commit('setActors', actors));
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
    }
  }
};

export default moduleShared;
