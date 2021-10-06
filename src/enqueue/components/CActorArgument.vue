<template>
  <div class="w-full md:w-full mb-6 md:mb-0" :class="{ 'py-2': !isChild }">
    <c-typed-input
      v-if="
        [
          'int',
          'float',
          'bool',
          'str',
          'datetime',
          'date',
          'datetime.time',
          'datetime.datetime'
        ].includes(argType)
      "
      v-model="inputValue"
      :arg-type="argType"
      :invalidInput="invalidInput"
      @validityUpdate="validity = $event"
    />
    <div v-else-if="argType === 'list' || argType.match(/^typing.List/)" class="h-full">
      <c-list-input
        v-if="!isChild"
        v-model="inputValue"
        :argType="argType"
        :name="name"
        @validityUpdate="validity = $event"
      />
      <c-default-input
        v-else
        v-model="inputValue"
        :parsing-is-changeable="false"
        @validityUpdate="validity = $event"
        @parseUpdate="$emit('parseUpdate', $event)"
        :parseAs="'Json'"
        :invalidInput="invalidInput"
      />
    </div>
    <div v-else-if="argType === 'dict' || argType.match(/^typing.Dict/)" class="h-full">
      <c-dict-input
        v-if="!isChild"
        v-model="inputValue"
        :argType="argType"
        :name="name"
        @validityUpdate="validity = $event"
      />
      <c-default-input
        v-else
        v-model="inputValue"
        :parsing-is-changeable="false"
        @validityUpdate="validity = $event"
        @parseUpdate="$emit('parseUpdate', $event)"
        :parseAs="'Json'"
        :invalidInput="invalidInput"
      />
    </div>
    <c-default-input
      v-else
      v-model="inputValue"
      :parsing-is-changeable="
        !name.match(/_key$/) && !name.match(/_value$/) && !name.match(/_key_input$/)
      "
      @validityUpdate="validity = $event"
      @parseUpdate="parseUpdate"
      :parseAs="parsingType"
      :invalidInput="invalidInput"
    />
  </div>
</template>

<script>
import CDictInput from '@/enqueue/components/CDictInput';
import CListInput from '@/enqueue/components/CListInput';
import CDefaultInput from '@/enqueue/components/CDefaultInput';
import CTypedInput from '@/enqueue/components/CTypedInput';

export default {
  name: 'CActorArgument',
  props: {
    name: String,
    argType: String,
    isChild: { type: Boolean, default: false },
    isInvalid: Boolean,
    parseAs: String,
    value: undefined
  },
  components: {
    CTypedInput,
    CDefaultInput,
    CListInput,
    CDictInput
  },
  data: function () {
    let parsingType = 'String';
    if (this.parseAs !== undefined) {
      parsingType = this.parseAs;
    }
    return {
      validity: true,
      parsingType: parsingType
    };
  },
  methods: {
    parseUpdate: function (newValue) {
      if (this.isChild) {
        this.$emit('parseUpdate', newValue);
      } else {
        this.parsingType = newValue;
      }
    }
  },
  computed: {
    invalidInput: function () {
      return (
        (!this.validity &&
          (Boolean(this.name.match(/_value$/)) || Boolean(this.name.match(/_key$/)))) ||
        this.isInvalid
      );
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
    validity: function (newValue) {
      this.$emit('validityUpdate', newValue);
    },
    parseAs: function (newValue) {
      this.parsingType = newValue;
    }
  }
};
</script>
