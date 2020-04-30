<template>
  <div class="container text-center pt-6 mx-auto">
    <table class="table-fixed w-full">
      <thead>
        <tr class="bg-gray-100 border-4">
          <th class="border-4 py-2">
            Message Id
          </th>
          <th class="border-4 px-4 py-2">
            State
          </th>
          <th class="border-4 px-4 py-2">Args</th>
          <th class="border-4 px-4 py-2">Kwargs</th>
          <td class="hidden sm:block">
            <div class="flex w-full">
              <input
                class="placeholder-gray-700 bg-gray-100 focus:outline-none  py-2 px-2 block w-full appearance-none leading-normal"
                id="filter"
                placeholder="Search..."
                type="text"
                v-model="filter"
              />
              <slot></slot>
            </div>
          </td>
        </tr>
      </thead>
      <tbody>
        <c-row
          v-for="m in filteredMessages"
          :key="m.message_id"
          :name="m.name"
          :args="m.args"
          :kwargs="m.kwargs"
          :message_id="m.message_id"
        ></c-row>
      </tbody>
    </table>
  </div>
</template>

<script>
import CRow from '@/components/CRow';
export default {
  name: 'CTable',
  components: { CRow },
  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      filter: ''
    };
  },

  computed: {
    filteredMessages() {
      if (!this.filter) {
        return this.messages;
      }
      const filterKeys = ['name', 'message_id'];
      return this.messages.filter(m =>
        filterKeys
          .map(key => m[key].toLowerCase())
          .join('~~')
          .includes(this.filter.toLowerCase())
      );
    }
  }
};
</script>

<style scoped>
td,
th {
  padding: 0rem;
  font-family: monospace;
}
</style>
