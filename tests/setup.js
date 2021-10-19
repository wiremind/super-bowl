import Vue from 'vue';
import Multiselect from 'vue-multiselect';
import JsonViewer from 'vue-json-viewer';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import draggable from 'vuedraggable';
import { format } from 'date-fns';

Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker);
Vue.component('multiselect', Multiselect);
Vue.component('json-viewer', JsonViewer);
Vue.component('draggable', draggable);
Vue.filter('percentage', value => (value ? Math.round(value * 100) + '%' : ''));
Vue.filter('datetime', value => (value ? format(value, 'y-MM-dd HH:mm') : ''));
