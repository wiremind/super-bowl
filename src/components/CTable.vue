<template>
  <div class="container text-center pt-6 mx-auto">
    <table class="table-fixed w-full">
      <thead>
        <tr class="bg-gray-100 border-4">
          <th class="border-4 py-2">Message Id</th>
          <th class="border-4 px-4 py-2">State</th>
          <th class="border-4 px-4 py-2">Args</th>
          <th class="border-4 px-4 py-2">Kwargs</th>
          <td class="hidden sm:block">
            <input
              class="placeholder-gray-700 bg-gray-100 focus:outline-none border-b border-gray-400 py-2 px-2 block w-full appearance-none leading-normal"
              id="filter"
              placeholder="Search..."
              type="text"
              v-model="filter"
            />
          </td>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="m in filteredMessages"
          :key="m.message_id"
          class="border-b border-gray-200 hover:bg-blue-100"
        >
          <td class="border px-4 py-2">{{ m.message_id }}</td>
          <td class="border px-4 py-2 font-semibold" v-bind:style="{ color: getColor(m.name) }">
            {{ m.name }}
          </td>
          <td class="border px-4 py-2">
            <pre class="text-xs whitespace-normal">{{ m.args }}</pre>
          </td>
          <td class="border px-4 py-2">
            <pre class="text-xs whitespace-normal">{{ m.kwargs }}</pre>
          </td>
          <td class="hidden sm:block"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'CTable',
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

  methods: {
    getColor(state) {
      state = state.toLowerCase();
      let color = 'black';
      if (state === 'success') {
        color = 'green';
      } else if (state === 'canceled' || state === 'failure') {
        color = 'red';
      }
      return color;
    }
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
}
</style>
