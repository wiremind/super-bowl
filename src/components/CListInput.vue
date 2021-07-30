<template>
  <div class="space-y-1">
    <form class="h-10 justify-between w-full flex flex-row mb-5" @submit.prevent="addElement">
      <c-actor-argument
        :argType="valueType"
        :name="name + '_list_input'"
        :isChild="true"
        v-model="typedValue"
        @parseUpdate="parseValueAs = $event"
        :parse-as="parseValueAs"
        @validityUpdate="typedValueValidity = $event"
      />
      <button type="submit" class="btn" :disabled="!typedValueValidity">
        <pre>+ Add</pre>
      </button>
    </form>
    <draggable
      v-model="value"
      @start="drag = true"
      @end="drag = false"
      handle=".handle"
      class="space-y-1"
    >
      <div v-for="(el, index) in value" :key="index" class="h-10 w-full flex my-1">
        <c-actor-argument
          :argType="valueType"
          :name="index + '_value'"
          :isChild="true"
          v-model="value[index]"
          @validityUpdate="$set(valuesValidity, index, $event)"
          :parseAs="parseValueAs"
        />
        <button type="button" @click="deleteValue(index)" class="btn btn-danger">Remove</button>
        <div class="flex bg-gray-300 rounded-r-xl handle">
          <img src="@/assets/img/arrows-alt-solid.svg" width="30rem" class="mx-3" />
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable';

export default {
  name: 'CListInput',
  props: {
    name: String,
    argType: String
  },
  data: function () {
    this.$emit('input', []);
    const valueType = this.argType.substring(
      this.argType.indexOf('[') + 1,
      this.argType.length - 1
    );
    return {
      valueType: valueType,
      typedValue: undefined,
      value: [],
      valuesValidity: [],
      parseValueAs: 'String',
      typedValueValidity: true
    };
  },
  components: { draggable, CActorArgument: () => import('./CActorArgument.vue') },
  methods: {
    addElement: function () {
      this.value.push(this.typedValue);
    },
    deleteValue: function (index) {
      this.valuesValidity.splice(index, 1);
      this.value.splice(index, 1);
    }
  },
  computed: {
    validity: function () {
      return this.valuesValidity.every(el => el);
    }
  },
  watch: {
    value: function (newValue) {
      this.$emit('input', newValue);
    },
    validity: function (newValue) {
      this.$emit('validityUpdate', newValue);
    }
  }
};
</script>
