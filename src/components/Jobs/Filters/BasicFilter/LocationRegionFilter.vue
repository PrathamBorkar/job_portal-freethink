<template>
  <div>
    <q-select
      ref="qSelect"
      outlined
      dense
      v-model="preferredLocations"
      :options="filteredOptions.length ? filteredOptions : locations"
      label="Select Preferred Locations"
      emit-value
      map-options
      multiple
      use-chips
      use-input
      fill-input
      input-debounce="0"
      :popup-content-class="'custom-dropdown'"
      :dropdown-icon="null"
      @filter="onFilter"
      @new-value="handleNewValue"
    >
      <template v-slot:append>
        <q-icon
          v-if="preferredLocations.length === 1"
          name="place"
          class="q-ml-xs"
        />
        <q-icon
          v-else-if="preferredLocations.length > 1"
          name="location_city"
          class="q-ml-xs"
        />
      </template>
    </q-select>
  </div>
</template>

<script>
import { useFilterStore } from "src/stores/filter-store";

export default {
  name: "LocationRegionFilter",

  data() {
    return {
      store: useFilterStore(),
      filteredOptions: [],
    };
  },

  computed: {
    preferredLocations: {
      get() {
        return this.store.preferredLocations || [];
      },
      set(val) {
        this.store.preferredLocations = val;
      },
    },

    locations() {
      // locations array from store: [{ label, value }, ...]
      return this.store.locations || [];
    },
  },

  methods: {
    onFilter(val, update) {
      if (!val || val.trim() === "") {
        this.filteredOptions = [];
        update();
        return;
      }

      const search = val.toLowerCase();

      this.filteredOptions = this.locations
        .filter((opt) => !this.preferredLocations.includes(opt.value))
        .filter((opt) => opt.label.toLowerCase().includes(search));

      update();
    },

    handleNewValue(inputValue) {
      const normalized = inputValue.trim().toLowerCase();

      const match = this.locations.find(
        (loc) => loc.label.toLowerCase() === normalized
      );

      if (match && !this.preferredLocations.includes(match.value)) {
        this.preferredLocations = [...this.preferredLocations, match.value];

        this.$refs.qSelect.updateInputValue("");
      }
    },
  },

  mounted() {
    // fetch filters if not already fetched
    if (this.locations.length === 0) {
      this.store.location;
    }
  },
};
</script>

<style scoped>
.custom-dropdown {
  max-height: 200px;
  overflow-y: auto;
}
</style>
