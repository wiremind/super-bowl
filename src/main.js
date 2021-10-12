import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import '@/assets/css/tailwind.css';

import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import JsonViewer from 'vue-json-viewer';
import 'vue-json-viewer/style.css';
import draggable from 'vuedraggable';

import routes from '@/routes';
import store from './store';
import { format } from 'date-fns';

Vue.use(VueRouter);
Vue.config.productionTip = false;

Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker);
Vue.component('multiselect', Multiselect);
Vue.component('json-viewer', JsonViewer);
Vue.component('draggable', draggable);
const router = new VueRouter({ routes, mode: 'history', linkExactActiveClass: 'bg-gray-900' });

Vue.filter('percentage', value => (value ? Math.round(value * 100) + '%' : ''));
Vue.filter('datetime', value => (value ? format(value, 'y-MM-dd HH:mm') : ''));
new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app');
