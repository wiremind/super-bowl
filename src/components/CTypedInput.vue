<template>
  <div>
    <input
      v-if="argType === 'int' || argType === 'float' || argType === 'bool' || argType === 'str'"
      :class="[argType === 'bool' ? 'w-10 h-10' : 'arg-input', { 'invalid-input': invalidInput }]"
      :type="
        argType === 'int' || argType === 'float'
          ? 'number'
          : argType === 'bool'
          ? 'checkbox'
          : 'text'
      "
      v-model="inputValue"
      :required="argType === 'int' || argType === 'float'"
      :step="argType === 'float' ? 'any' : 1"
    />
    <VueCtkDateTimePicker
      v-else
      v-model="inputValue"
      :format="
        argType === 'datetime' || argType === 'datetime.datetime'
          ? 'YYYY-MM-DD HH:mm'
          : 'YYYY-MM-DD'
      "
      :formatted="argType === 'date' || argType === 'datetime.date' ? 'll' : 'llll'"
      :only-date="argType === 'date' || argType === 'datetime.date'"
      :class="{ 'invalid-input border': invalidInput }"
    />
  </div>
</template>

<script>
export default {
  name: 'CTypedInput',
  props: {
    argType: String,
    value: undefined,
    invalidInput: Boolean
  },
  computed: {
    validity: function() {
      if (
        this.argType === 'datetime' ||
        this.argType === 'date' ||
        this.argType === 'datetime.date' ||
        this.argType === 'datetime.datetime'
      ) {
        return this.inputValue !== null;
      } else if (this.argType === 'int') {
        return (
          !isNaN(parseInt(this.inputValue)) &&
          parseInt(this.inputValue) === parseFloat(this.inputValue)
        );
      } else if (this.argType === 'float') {
        return !isNaN(parseFloat(this.inputValue));
      }
      return true;
    },
    inputValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
  watch: {
    validity: function(newValue) {
      this.$emit('validityUpdate', newValue);
    }
  },
  created: function() {
    if (this.inputValue === undefined) {
      switch (this.argType) {
        case 'int':
        case 'float':
          this.$emit('input', 0);
          break;
        case 'bool':
          this.$emit('input', false);
          break;
        case 'str':
          this.$emit('input', '');
          break;
        default:
          this.$emit('input', null);
      }
    }
    this.$emit('validityUpdate', this.validity);
  }
};
</script>
