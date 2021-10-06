import Vue from 'vue';
import Vuex from 'vuex';
import moduleMessages from '@/messages/store';
import moduleSchedule from '@/schedule/store';
import moduleEnqueue from '@/enqueue/store';
import moduleShared from '@/shared/store';

Vue.use(Vuex);
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    messages: moduleMessages,
    schedule: moduleSchedule,
    enqueue: moduleEnqueue
  },
  ...moduleShared
});
export default store;
