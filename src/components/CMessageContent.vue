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
      <pre
        class="text-xs bg-white"
      ><span class="font-bold inline-block">Args</span>:{{args | json}}</pre>
      <pre
        class="text-xs bg-white"
      ><span class="font-bold inline-block">Kwargs</span>:{{kwargs | json}}</pre>
      <pre
        class="text-xs bg-white"
      ><span class="font-bold inline-block">Options</span>:{{options | json}}</pre>
    </td>
    <td class="border text-xs px-4 py-2" :colspan="3">
      <p class="text-xs bg-white" v-if="result">
        <span class="font-bold inline-block">Result</span>
        :{{ result }}
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
    colspan: Number
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
      if (this.message.status) {
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
    api.getArgsKwargs(this.message.messageId).then(res => {
      this.args = res.args;
      this.kwargs = res.kwargs;
      this.options = res.options;
    });
    this.updateResult();
  }
};
</script>
