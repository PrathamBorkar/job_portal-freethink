<template>
  <q-option-group
    v-model="selectedJobMode"
    :options="jobModes"
    type="radio"
    label="Job Mode"
    inline
    dense
    class="job-mode-radio-group"
  />
</template>

<script>
import { useFilterStore } from "src/stores/filter-store";

export default {
  name: "JobModeFilter",

  computed: {
    jobModes() {
      return [
        { label: "Online", value: "Online" },
        { label: "Offline", value: "Offline" },
        { label: "Hybrid", value: "Hybrid" },
      ];
    },

    selectedJobMode: {
      get() {
        return useFilterStore().jobMode;
      },
      set(val) {
        useFilterStore().jobMode = val;
      },
    },
  },
};
</script>

<style scoped>
.job-mode-radio-group {
  /* Optional styling */
  margin: 1rem 0;
  font-family: "Inter", sans-serif;
  font-size: 16px;
}
</style>
