import api from '@/shared/api';

const moduleShared = {
  state: {
    actors: []
  },
  mutations: {
    setActors(state, actors) {
      state.actors = actors;
    }
  },
  actions: {
    getActors(context) {
      api.getActors().then(actors => context.commit('setActors', actors));
    }
  }
};

export default moduleShared;
