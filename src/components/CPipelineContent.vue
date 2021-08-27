<template>
  <tr class="border text-xs px-4 py-2">
    <td :colspan="colspan" class="px-4 pt-2">
      <div class="m-10">
        <div class="border flex">
          <div
            v-for="(m, index) in message.messages"
            :key="index + '_content'"
            class="border p-5 w-full text-center font-bold"
            :class="{ 'border-black': index === currentActorIndex }"
            @click="toggle(index)"
          >
            <div>
              {{ m.actorName }}
              <template v-if="m.status">
                :
                <span :style="{ color: statusStyles[m.status] || 'black' }">
                  {{ m.status }}
                </span>
              </template>
            </div>
          </div>
        </div>
        <div class="border" v-if="openedActorIndex !== null">
          <c-message-content
            :message="message.messages[openedActorIndex]"
            class="w-10"
            :key="message.messageId + '_content'"
            :colspan="colspan"
            :extra_info="true"
          />
        </div>
      </div>
    </td>
  </tr>
</template>

<script>
import CMessageContent from '@/components/CMessageContent';
export default {
  name: 'CPipelineContent',
  components: { CMessageContent },
  props: {
    message: Object,
    colspan: Number
  },
  data: function () {
    return {
      statusStyles: {
        Success: 'green',
        Canceled: 'red',
        Failure: 'red'
      },
      openedActorIndex: null
    };
  },
  computed: {
    currentActorIndex: function () {
      const index = Math.max(this.message.messages.findIndex(el => el.status === undefined) - 1, 0);
      if (index === -2) {
        return this.message.messages.length - 1;
      } else {
        return index;
      }
    }
  },
  methods: {
    toggle: function (index) {
      if (this.openedActorIndex === index) {
        this.openedActorIndex = null;
      } else {
        this.openedActorIndex = null;
        this.openedActorIndex = index;
      }
    }
  }
};
</script>
