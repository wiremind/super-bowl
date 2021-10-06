import api from '@/schedule/api';

const moduleSchedule = {
  state: {
    jobs: [],
    currentPath: null
  },
  mutations: {
    setJobs(state, jobs) {
      state.jobs = jobs;
    }
  },
  actions: {
    getJobs(context) {
      context.commit('setLoading', true);
      api.getJobs().then(jobs => {
        setTimeout(() => {
          context.commit('setLoading', false);
        }, 500);
        context.commit('setJobs', jobs);
      });
    },
    saveJob(context, job) {
      context.commit('setLoading', true);
      api.updateJob(job).then(jobs => {
        setTimeout(() => {
          context.commit('setLoading', false);
        }, 500);
        context.commit('setJobs', jobs);
      });
    }
  }
};

export default moduleSchedule;
