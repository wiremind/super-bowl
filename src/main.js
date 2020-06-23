import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import '@/assets/css/tailwind.css';

import routes from '@/routes';
import store from './store';

Vue.use(VueRouter);
Vue.config.productionTip = false;

const router = new VueRouter({ routes, mode: 'history', linkExactActiveClass: 'bg-gray-900' });

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app');
