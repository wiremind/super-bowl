import Vue from 'vue';
import Multiselect from 'vue-multiselect';
import JsonViewer from 'vue-json-viewer';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import draggable from 'vuedraggable';

Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker);
Vue.component('multiselect', Multiselect);
Vue.component('json-viewer', JsonViewer);
Vue.component('draggable', draggable);
