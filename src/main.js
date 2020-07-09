import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import '@/assets/css/tailwind.css';

import routes from '@/routes';
import store from './store';
import { format } from 'date-fns';

Vue.use(VueRouter);
Vue.config.productionTip = false;

const router = new VueRouter({ routes, mode: 'history', linkExactActiveClass: 'bg-gray-900' });

Vue.filter('percentage', value => (value ? Math.round(value * 100) + '%' : ''));
Vue.filter('datetime', value => (value ? format(value, 'y-MM-dd HH:mm') : ''));
new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app');
