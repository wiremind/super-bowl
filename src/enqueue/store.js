import api from '@/enqueue/api';

const moduleEnqueue = {
  states: {
    options: []
  },
  mutations: {
    setOptions(state, options) {
      state.options = options;
    }
  },
  actions: {
    getOptions(context) {
      api.getOptions().then(options => context.commit('setOptions', options));
    },
    enqueueMessage(context, message) {
      return api.enqueueMessage(message);
    }
  }
};

export default moduleEnqueue;
