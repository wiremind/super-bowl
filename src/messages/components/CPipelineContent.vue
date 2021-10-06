<template>
  <tr class="border text-xs px-4 py-2">
    <td :colspan="colspan" class="px-4 pt-2">
      <div class="m-10">
        <div class="border flex">
          <div
            v-for="(m, index) in message.messages"
            :key="index + '_content'"
            class="border p-5 w-full text-center font-bold"
            :class="{ 'bg-gray-200': index === openedActorIndex }"
            @click="toggle(index)"
          >
            <div>
              {{ m.actorName || m.type.toUpperCase() }}
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
          <c-group-content
            v-if="message.messages[openedActorIndex].type === 'group'"
            :message="message.messages[openedActorIndex]"
            :key="message.messageId + '_content'"
            :colspan="colspan"
            :inTable="false"
          />
          <c-message-content
            v-else
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
import CMessageContent from '@/messages/components/CMessageContent';
import CGroupContent from '@/messages/components/CGroupContent';
export default {
  name: 'CPipelineContent',
  components: { CGroupContent, CMessageContent },
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
