<template>
  <div class="flex h-full mr-3">
    <input
      type="text"
      v-model="rawValue"
      :class="['arg-input', { 'invalid-input': invalidInput }]"
    />
    <div v-if="parsingIsChangeable">
      <label class="text-xs absolute px-1">Parse as :</label>
      <select class="h-full pt-2 bg-white" v-model="parseInput">
        <option>String</option>
        <option>Json</option>
      </select>
    </div>
  </div>
</template>

<script>
import utils from '@/shared/utils';

export default {
  name: 'CDefaultInput',
  props: {
    parsingIsChangeable: Boolean,
    parseAs: String,
    value: undefined,
    invalidInput: Boolean
  },
  data: function () {
    return {
      displayValue: this.rawValue
    };
  },
  computed: {
    validity: function () {
      if (this.parseAs === 'Json') {
        return utils.isJson(this.rawValue);
      } else {
        return true;
      }
    },
    rawValue: {
      get() {
        if (typeof this.value == 'object') {
          if (
            utils.isJson(this.displayValue) &&
            JSON.stringify(this.value) === JSON.stringify(JSON.parse(this.displayValue))
          ) {
            return this.displayValue;
          }
          return JSON.stringify(this.value);
        } else {
          return this.value;
        }
      },
      set(val) {
        if (this.parseAs === 'Json') {
          if (utils.isJson(val)) {
            this.$emit('input', JSON.parse(val));
          } else {
            this.$emit('input', val);
          }
        } else {
          this.$emit('input', val);
        }
        this.displayValue = val;
      }
    },
    parseInput: {
      get() {
        return this.parseAs;
      },
      set(val) {
        this.$emit('parseUpdate', val);
      }
    }
  },
  watch: {
    validity: function (newValue) {
      this.$emit('validityUpdate', newValue);
    },
    parseAs: function (newValue) {
      if (newValue === 'Json') {
        if (utils.isJson(this.rawValue)) {
          this.$emit('input', JSON.parse(this.rawValue));
        } else {
          this.$emit('input', this.rawValue);
        }
      } else {
        this.$emit('input', this.rawValue);
      }
    }
  },
  created: function () {
    if (this.rawValue === undefined) {
      this.$emit('input', '');
    }
    this.$emit('validityUpdate', this.validity);
  }
};
</script>
