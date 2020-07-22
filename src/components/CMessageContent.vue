<template>
  <tr>
    <td class="border text-xs px-4 py-2" :colspan="colspan">
      <div class="text-xs">
        <div class="font-bold inline-block">Message Id</div>
        :{{ messageId }}
      </div>
      <div class="text-xs">
        <div class="font-bold inline-block">Queue Name</div>
        :{{ queueName }}
      </div>
      <pre
        class="text-xs bg-white"
      ><div class="font-bold inline-block">Args</div>:{{args | json}}</pre>
      <pre
        class="text-xs bg-white"
      ><div class="font-bold inline-block">Kwargs</div>:{{kwargs | json}}</pre>
    </td>
  </tr>
</template>

<script>
import utils from '@/utils';
import api from '@/api';
export default {
  name: 'CMessageContent',
  props: {
    messageId: String,
    actorName: String,
    colspan: Number
  },
  data() {
    return {
      args: String,
      kwargs: String
    };
  },
  computed: {
    queueName() {
      const actors = this.$store.getters.actorsByName;
      return actors[this.actorName] ? actors[this.actorName].queueName : '';
    }
  },
  filters: {
    json(str) {
      return str && utils.isJson(str) ? JSON.stringify(utils.toJson(str), undefined, 2) : '';
    }
  },
  created() {
    api.getArgsKwargs(this.messageId).then(res => {
      this.args = res.args;
      this.kwargs = res.kwargs;
    });
  }
};
</script>
