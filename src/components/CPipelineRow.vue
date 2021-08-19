<template>
  <tr class="border-b text-xs border-gray-200 hover:bg-blue-100 cursor-pointer" @click="onToggle">
    <td class="border px-4 py-2 flex">
      <img v-if="isOpened" src="@/assets/img/expand_more.svg" width="20rem" />
      <img v-else src="@/assets/img/expand_less.svg" width="20rem" />
      <pre class="text-xs ml-2 whitespace-normal">{{ actorNames }}</pre>
    </td>
    <td class="border px-4 py-2">
      {{ messages[currentActorIndex].priority }}
    </td>
    <td class="border px-4 py-2 font-semibold" :style="{ color: getColorState() }">
      {{ messages[currentActorIndex].name }}
    </td>
  </tr>
</template>

<script>
export default {
  name: 'CPipelineRow',
  props: {
    messages: Array
  },
  data: function () {
    return {
      isOpened: false
    };
  },
  methods: {
    onToggle() {
      this.isOpened = !this.isOpened;
      this.$emit('toggle', this.messageId);
    },
    getColorState() {
      const colors = {
        Success: 'green',
        Canceled: 'red',
        Failure: 'red'
      };
      return colors[this.messages[this.currentActorIndex].name] || 'black';
    }
  },
  computed: {
    actorNames: function () {
      let actorString = '';
      this.messages.forEach(message => (actorString += ' ' + message.actorName));
      return actorString;
    },
    currentActorIndex: function () {
      return this.messages.findIndex(el => el.name === undefined) - 1;
    }
  }
};
</script>
