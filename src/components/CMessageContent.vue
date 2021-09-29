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
        <json-viewer :value="args" />
      </div>
      <div class="text-xs bg-white whitespace-pre-wrap">
        <span class="font-bold inline-block">Kwargs :</span>
        <json-viewer :value="kwargs" />
      </div>
      <div class="text-xs bg-white whitespace-pre-wrap">
        <span class="font-bold inline-block">Options :</span>
        <json-viewer :value="options" />
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
import utils from '@/utils';

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
      args: {},
      kwargs: {},
      options: {},
      result: null
    };
  },
  computed: {
    queueName() {
      const actors = this.$store.getters.actorsByName;
      return actors[this.message.actorName] ? actors[this.message.actorName].queueName : '';
    },
    waitTime() {
      const diff = utils.formatMillis(this.message.waitTime);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    remainingTime() {
      const diff = utils.formatMillis(this.message.remainingTime);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    executionTime() {
      const diff = utils.formatMillis(this.message.executionTime);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    }
  },
  methods: {
    updateResult() {
      if (this.message.status === 'Success') {
        api.getResult(this.message.messageId).then(res => {
          this.result = res;
        });
      }
    },
    getDetails() {
      if (this.message.status !== 'Not yet enqueued') {
        api.getArgsKwargs(this.message.messageId).then(res => {
          this.args = JSON.parse(res.args);
          this.kwargs = JSON.parse(res.kwargs);
          this.options = JSON.parse(res.options);
        });
        this.updateResult();
      } else {
        this.args = null;
        this.kwargs = null;
        this.options = null;
      }
    }
  },
  watch: {
    stateName() {
      this.updateResult();
    },
    message() {
      this.getDetails();
    }
  },
  created() {
    this.getDetails();
  }
};
</script>
