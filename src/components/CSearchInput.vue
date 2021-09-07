<template>
  <div>
    <div class="flex float-left space-x-3 mb-3 ml-6 my-2">
      <vue-ctk-date-time-picker
        v-model="minDateTime"
        format="YYYY-MM-DD HH:mm"
        formatted="ddd DD MMM YYYY HH:mm"
        label="Min Date and Time"
      />
      <button class="btn" :disabled="minDateTime == null" @click="clean">Clean</button>
    </div>
    <div class="flex float-right space-x-5 mb-3 search relative mr-6 my-2 w-3/4">
      <select v-model="selectedType">
        <option :value="null">All</option>
        <option value="messages">Messages</option>
        <option value="compositions">Groups/Pipelines</option>
      </select>
      <vue-ctk-date-time-picker
        v-model="startDateTime"
        format="YYYY-MM-DD HH:mmZ"
        formatted="ddd DD MMM YYYY HH:mm"
        label="Start date"
        timeZone="fr"
      />
      <vue-ctk-date-time-picker
        v-model="endDateTime"
        format="YYYY-MM-DD HH:mm"
        formatted="ddd DD MMM YYYY HH:mm"
        label="End date"
        timeZone="fr"
      />
      <multiselect
        v-model="selectedActors"
        :options="actor_group"
        :multiple="true"
        :close-on-select="false"
        :clear-on-select="false"
        :preserve-search="true"
        placeholder="Pick Actors"
        group-values="actors"
        group-label="name"
        :group-select="true"
      >
        <span slot="noResult">No actors found.</span>
        <template slot="selection" slot-scope="{ values, search, isOpen }">
          <span class="multiselect__single" v-if="values.length && !isOpen">
            {{ values.length }} actors selected
          </span>
          <span v-else-if="isOpen"></span>
        </template>
      </multiselect>
      <multiselect
        v-model="selectedStatuses"
        :options="status_list"
        :multiple="true"
        :close-on-select="false"
        :clear-on-select="false"
        :preserve-search="true"
        placeholder="Pick Statuses"
        group-values="statuses"
        group-label="name"
        :group-select="true"
      >
        <span slot="noResult">No statuses found.</span>
        <template slot="selection" slot-scope="{ values, search, isOpen }">
          <span class="multiselect__single" v-if="values.length && !isOpen">
            {{ values.length }} statuses selected
          </span>
          <span v-else-if="isOpen"></span>
        </template>
      </multiselect>
      <input v-model="selectedId" placeholder="Enter Id" />
      <div class="loader absolute right-0" v-if="isLoading">Loading...</div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'CSearchInput',
  data: function () {
    return {
      status_list: [
        {
          name: 'All',
          statuses: ['Started', 'Pending', 'Skipped', 'Canceled', 'Failure', 'Success']
        }
      ],
      minDateTime: null
    };
  },
  methods: {
    clean: function () {
      this.$store.dispatch('cleanStates', this.minDateTime);
    }
  },
  computed: {
    ...mapState(['isLoading', 'messages', 'actors']),
    actor_group: function () {
      if (this.actors.length > 0) {
        const actorNames = this.actors.map(actor => actor.name);
        if (this.$store.state.selectedActors == null) {
          this.$store.dispatch('updateSelectedActors', actorNames);
        }
        return [{ name: 'All', actors: actorNames }];
      } else {
        return [{ name: 'All', actors: [] }];
      }
    },
    selectedActors: {
      get() {
        return this.$store.state.selectedActors;
      },
      set(select) {
        if (this.$store.state.selectedActors === null && select.length === 0) {
          return;
        }
        this.$store.dispatch('updateSelectedActors', select);
      }
    },
    selectedStatuses: {
      get() {
        return this.$store.state.selectedStatuses;
      },
      set(select) {
        this.$store.dispatch('updateSelectedStatuses', select);
      }
    },
    selectedId: {
      get() {
        return this.$store.state.selectedId;
      },
      set(select) {
        this.$store.dispatch('updateSelectedId', select);
      }
    },
    startDateTime: {
      get() {
        return this.$store.state.startDateTime;
      },
      set(select) {
        this.$store.dispatch('updateStartDateTime', select);
      }
    },
    endDateTime: {
      get() {
        return this.$store.state.endDateTime;
      },
      set(select) {
        this.$store.dispatch('updateEndDateTime', select);
      }
    },
    selectedType: {
      get() {
        return this.$store.state.selectedType;
      },
      set(select) {
        this.$store.dispatch('updateSelectedType', select);
      }
    }
  }
};
</script>
