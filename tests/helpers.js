import Vuex from 'vuex';
import { createLocalVue, mount } from '@vue/test-utils';

const localVue = createLocalVue();
localVue.use(Vuex);

const DateTimeStub = {
  name: 'datetime-stub',
  template: '<input v-model="inputValue" class="datetime-stub">',
  props: ['value'],
  computed: {
    inputValue: {
      get() {
        return this.value;
      },
      set(val) {
        if (val === '') {
          this.$emit('input', null);
        } else {
          this.$emit('input', val);
        }
      }
    }
  }
};

function getWrapper(component, store) {
  return mount(component, {
    store: new Vuex.Store(store),
    localVue,
    stubs: {
      VueCtkDateTimePicker: DateTimeStub
    }
  });
}

function findByText(wrapper, element, text) {
  return wrapper
    .findAll(element)
    .filter(node => node.text() === text)
    .at(0);
}

export default {
  getWrapper,
  findByText
};
