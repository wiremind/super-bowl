<template>
  <div class="w-full md:w-full mb-6 md:mb-0">
    <label class="enqueue-label text-base my-5">Options</label>
    <div class="w-full md:w-full h-10 flex justify-between mb-3">
      <select class="arg-input w-1/2 mr-2" v-model="selectedOption" @change="selectOption" required>
        <option v-for="(optionType, option) in filteredOptions" :key="option" :value="option">
          {{ option }} : {{ optionType }}
          {{
            optionsTypes[option] && optionsTypes[option].unit !== undefined
              ? '(' + optionsTypes[option].unit + ')'
              : ''
          }}
        </option>
      </select>
      <c-actor-argument
        :isChild="true"
        v-model="typedValue"
        name="optionInput"
        :argType="
          this.filteredOptions[this.selectedOption] !== undefined
            ? this.filteredOptions[this.selectedOption]
            : 'str'
        "
        class="w-1/2"
        @validityUpdate="inputValidity = $event"
      />
      <button type="button" class="btn" @click="addOption" :disabled="!inputValidity">
        <pre>+ Add</pre>
      </button>
    </div>
    <div class="space-y-1">
      <div
        v-for="(optionValue, option) in inputOptions"
        :key="option"
        class="h-10 w-full flex flex-row"
      >
        <label class="arg-input w-auto flex-shrink-0 pr-1 py-3">
          {{ option }}
          {{ optionsTypes[option].unit !== undefined ? '(' + optionsTypes[option].unit + ')' : '' }}
          :
        </label>
        <c-actor-argument
          :isChild="true"
          v-model="inputOptions[option]"
          :name="option + '_input'"
          :argType="optionsTypes[option].type"
          :isInvalid="!optionsValidity[option]"
          @validityUpdate="$set(optionsValidity, option, $event)"
        />
        <button type="button" @click="$delete(inputOptions, option)" class="btn btn-danger">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import CActorArgument from '@/enqueue/components/CActorArgument';

export default {
  name: 'COptionsInput',
  components: { CActorArgument },
  props: ['value', 'options'],
  data: function () {
    return {
      selectedOption: '',
      typedValue: '',
      inputValidity: true,
      optionsValidity: {},
      optionsTypes: {
        on_failure: { type: 'str' },
        time_limit: { type: 'int', unit: 'ms' },
        max_age: { type: 'int', unit: 'ms' },
        notify_shutdown: { type: 'bool' },
        pipe_ignore: { type: 'bool' },
        min_backoff: { type: 'int', unit: 'ms' },
        on_success: { type: 'str' },
        store_results: { type: 'bool' },
        max_retries: { type: 'int' },
        result_ttl: { type: 'int', unit: 'ms' },
        max_backoff: { type: 'int', unit: 'ms' },
        logging_metadata: { type: 'dict' },
        backoff_strategy: { type: 'str' },
        jitter: { type: 'bool' }
      }
    };
  },
  methods: {
    selectOption: function () {
      this.inputValidity = true;
      switch (this.filteredOptions[this.selectedOption]) {
        case 'int':
          this.typedValue = 0;
          break;
        case 'bool':
          this.typedValue = false;
          break;
        default:
          this.typedValue = '';
      }
    },
    addOption() {
      if (!this.selectedOption) {
        return;
      }
      this.$set(this.inputOptions, this.selectedOption, this.typedValue);
      this.$set(this.optionsValidity, this.selectedOption, true);
      this.selectedOption = null;
    }
  },
  computed: {
    inputOptions: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    },
    filteredOptions: function () {
      const filteredDict = {};
      if (this.options) {
        for (const option of this.options) {
          if (this.optionsTypes[option] != null && this.inputOptions[option] === undefined) {
            filteredDict[option] = this.optionsTypes[option].type;
          }
        }
      }
      return filteredDict;
    },
    validity: function () {
      return Object.values(this.optionsValidity).every(el => el);
    }
  },
  watch: {
    validity(newValue) {
      this.$emit('validityUpdate', newValue);
    }
  }
};
</script>
