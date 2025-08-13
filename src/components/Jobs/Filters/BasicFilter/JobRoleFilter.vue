<template>
  <div>
    <q-select
      ref="qSelect"
      outlined
      dense
      v-model="selectedJobRoles"
      :options="filteredOptions.length ? filteredOptions : jobRoles"
      label="Select job roles"
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
          v-if="selectedJobRoles.length === 1"
          name="work_outline"
          class="q-ml-xs"
        />
        <q-icon
          v-else-if="selectedJobRoles.length > 1"
          name="work"
          class="q-ml-xs"
        />
      </template>
    </q-select>
  </div>
</template>

<script>
import { useFilterStore } from "../../../../stores/filter-store";

export default {
  name: "JobRoleFilter",

  data() {
    return {
      filteredOptions: [],
      store: useFilterStore(),
    };
  },

  computed: {
    jobRoles() {
      // Expecting [{ label, value }, ...] from store
      return this.store.jobRoles || [];
    },

    selectedJobRoles: {
      get() {
        return this.store.selectedJobRoles || [];
      },
      set(val) {
        this.store.selectedJobRoles = val;
      },
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

      // Filter out selected roles and match label with search input
      this.filteredOptions = this.jobRoles
        .filter((opt) => !this.selectedJobRoles.includes(opt.value))
        .filter((opt) => opt.label.toLowerCase().includes(search));

      update();
    },

    handleNewValue(inputValue) {
      const normalized = inputValue.trim().toLowerCase();

      // Check if the input already exists
      const match = this.jobRoles.find(
        (role) => role.label.toLowerCase() === normalized
      );

      if (match && !this.selectedJobRoles.includes(match.value)) {
        this.selectedJobRoles = [...this.selectedJobRoles, match.value];

        this.$refs.qSelect.updateInputValue("");
      }
    },
  },

  mounted() {
    // Fetch jobRoles if empty
    if (this.jobRoles.length === 0) {
      this.store.jobRoles;
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
