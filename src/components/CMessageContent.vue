<template>
  <tr>
    <td class="border text-xs px-4 py-2" :colspan="colspan - 3">
      <div class="text-xs">
        <div class="font-bold inline-block">Message Id</div>
        : {{ message.messageId }}
      </div>
      <div class="text-xs">
        <div class="font-bold inline-block">Queue Name</div>
        : {{ message.queueName }}
      </div>
      <div class="text-xs" v-if="extra_info">
        <div class="font-bold inline-block">Priority :</div>
        {{ message.priority }}
      </div>
      <div class="text-xs" v-if="extra_info">
        <div class="font-bold inline-block">Started at :</div>
        {{ message.startedDatetime | datetime }}
      </div>
      <div
        class="text-xs"
        v-if="
          extra_info &&
          message.waitTime &&
          (message.status === 'Pending' || message.startedDatetime)
        "
      >
        <div class="font-bold inline-block">Wait time :</div>
        {{ waitTime }}
      </div>
      <div class="text-xs" v-if="extra_info && message.executionTime">
        <div class="font-bold inline-block">Execution time :</div>
        {{ executionTime }}
      </div>
      <div class="text-xs" v-if="extra_info && message.remainingTime">
        <div class="font-bold inline-block">Remaining time :</div>
        {{ remainingTime }}
      </div>
      <div class="text-xs" v-if="extra_info && !message.endDateTime">
        <div class="font-bold inline-block">Progress :</div>
        {{ message.progress }}
      </div>
      <div class="text-xs bg-white whitespace-pre-wrap">
        <span class="font-bold inline-block">Args :</span>
        {{ args | json }}
      </div>
      <div class="text-xs bg-white whitespace-pre-wrap">
        <span class="font-bold inline-block">Kwargs :</span>
        {{ kwargs | json }}
      </div>
      <div class="text-xs bg-white whitespace-pre-wrap">
        <span class="font-bold inline-block">Options :</span>
        {{ options | json }}
      </div>
    </td>
    <td class="border text-xs px-4 py-2" :colspan="3">
      <p class="text-xs bg-white" v-if="result">
        <span class="font-bold inline-block">Result :</span>
        {{ result }}
      </p>
    </td>
  </tr>
</template>

<script>
import api from '@/api';

export default {
  name: 'CMessageContent',
  props: {
    message: Object,
    colspan: Number,
    extra_info: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      args: String,
      kwargs: String,
      options: String,
      result: null
    };
  },
  filters: {
    json(obj) {
      return obj ? JSON.stringify(obj) : null;
    }
  },
  methods: {
    updateResult() {
      if (this.message.status === 'Success') {
        api.getResult(this.message.messageId).then(res => {
          this.result = res;
        });
      }
    }
  },
  watch: {
    stateName() {
      this.updateResult();
    },
    message() {
      if (this.message.status !== 'Not yet enqueued') {
        api.getArgsKwargs(this.message.messageId).then(res => {
          this.args = res.args;
          this.kwargs = res.kwargs;
          this.options = res.options;
        });
        this.updateResult();
      } else {
        this.args = null;
        this.kwargs = null;
        this.options = null;
      }
    }
  },
  created() {
    if (this.message.status !== 'Not yet enqueued') {
      api.getArgsKwargs(this.message.messageId).then(res => {
        this.args = res.args;
        this.kwargs = res.kwargs;
        this.options = res.options;
      });
      this.updateResult();
    }
  }
};
</script>
