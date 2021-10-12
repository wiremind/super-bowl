<template>
  <div class="space-y-1">
    <div class="h-10 w-full flex space-x-1 flex-row justify-between mb-5">
      <c-actor-argument
        :argType="keyType"
        :name="name + '_key_input'"
        :isChild="true"
        v-model="typedKey"
        @validityUpdate="typedKeyValidity = $event"
      />
      <c-actor-argument
        :argType="valueType"
        :name="name + '_value_input'"
        :isChild="true"
        v-model="typedValue"
        @parseUpdate="parseValueAs = $event"
        :parseAs="parseValueAs"
        @validityUpdate="typedValueValidity = $event"
      />
      <button class="btn" type="button" :disabled="isInvalid" @click="addKey">
        <pre>+ Add</pre>
      </button>
    </div>
    <div v-for="(el, index) in valueMap" :key="index" class="h-10 w-full flex space-x-1">
      <c-actor-argument
        :argType="keyType"
        :name="index + '_key'"
        :isChild="true"
        :value="valueMap[index].key"
        @input="changeKey(index, $event)"
        @validityUpdate="changeElement(index, { keyValueValidity: $event })"
        :isInvalid="!valueMap[index].keyElementValidity"
      />
      <c-actor-argument
        :argType="valueType"
        :name="index + '_value'"
        :isChild="true"
        v-model="valueMap[index].value"
        @validityUpdate="changeElement(index, { valueValidity: $event })"
        :isInvalid="!valueMap[index].valueValidity"
        :parseAs="parseValueAs"
      />
      <button type="button" @click="deleteKey(index)" class="btn btn-danger">Remove</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CDictInput',
  components: { CActorArgument: () => import('./CActorArgument.vue') },
  props: {
    name: String,
    argType: String
  },
  data: function () {
    this.$emit('input', {});
    let keyType, valueType;
    if (!this.argType.includes('[')) {
      keyType = 'empty';
      valueType = 'empty';
    } else {
      keyType = this.argType.substring(this.argType.indexOf('[') + 1, this.argType.indexOf(','));
      valueType = this.argType.substring(this.argType.indexOf(',') + 2, this.argType.length - 1);
    }
    return {
      keyType: keyType,
      valueType: valueType,
      typedKey: undefined,
      typedValue: undefined,
      valueMap: [],
      parseValueAs: 'String',
      typedValueValidity: true,
      typedKeyValidity: true
    };
  },
  methods: {
    addKey() {
      if (
        this.valueMap.findIndex(el => el.key === this.typedKey) === -1 &&
        ((this.keyType !== 'int' && this.keyType !== 'float') ||
          this.valueMap.findIndex(el => parseFloat(el.key) === parseFloat(this.typedKey)) === -1)
      ) {
        this.valueMap.push({
          key: this.typedKey,
          value: this.typedValue,
          keyValueValidity: true,
          keyElementValidity: true,
          valueValidity: true
        });
      }
    },
    changeKey(index, newValue) {
      const wasKeyValid = this.valueMap[index].keyElementValidity;
      const oldKey = this.valueMap[index].key;
      this.changeElement(index, {
        key: newValue,
        keyElementValidity:
          newValue !== '' &&
          newValue !== null &&
          this.valueMap.findIndex(el => el.key === newValue) === -1 &&
          ((this.keyType !== 'int' && this.keyType !== 'float') ||
            this.valueMap.findIndex(el => parseFloat(el.key) === parseFloat(newValue)) === -1)
      });
      if (wasKeyValid) {
        let posSameKey = this.valueMap.findIndex(el => el.key === oldKey);
        if (posSameKey === -1 && (this.keyType === 'int' || this.keyType === 'float')) {
          posSameKey = this.valueMap.findIndex(el => parseInt(el.key) === parseInt(oldKey));
        }
        if (posSameKey !== -1) {
          this.changeElement(posSameKey, { keyElementValidity: true });
        }
      }
    },
    deleteKey(index) {
      const oldKey = this.valueMap[index].key;
      const wasKeyValid = this.valueMap[index].keyElementValidity;
      this.valueMap.splice(index, 1);
      let posSameKey = this.valueMap.findIndex(el => el.key === oldKey);
      if (posSameKey === -1 && (this.keyType === 'int' || this.keyType === 'float')) {
        posSameKey = this.valueMap.findIndex(el => parseInt(el.key) === parseInt(oldKey));
      }
      if (wasKeyValid && posSameKey !== -1) {
        this.changeElement(posSameKey, { keyElementValidity: true });
      }
    },
    changeElement(index, obj) {
      const newElement = this.valueMap[index];
      for (const key in obj) {
        newElement[key] = obj[key];
      }
      this.$set(this.valueMap, index, newElement);
    }
  },
  computed: {
    isInvalid: function () {
      const isKeyEmpty = this.typedKey === '';
      return isKeyEmpty || !this.typedValueValidity || !this.typedKeyValidity;
    },
    value: function () {
      const val = {};
      for (let i = 0; i < this.valueMap.length; i++) {
        if (
          this.valueMap[i].keyValueValidity &&
          this.valueMap[i].keyElementValidity &&
          this.valueMap[i].valueValidity
        ) {
          val[this.valueMap[i].key] = this.valueMap[i].value;
        }
      }
      return val;
    },
    validity: function () {
      return this.valueMap.every(
        el => el.keyValueValidity && el.keyElementValidity && el.valueValidity
      );
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
