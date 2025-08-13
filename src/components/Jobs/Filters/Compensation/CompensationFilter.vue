<template>
  <div class="compensation-section">
    <div class="text-h6 q-mb-md">Compensation</div>

    <div class="row q-col-gutter-md">
      <!-- Salary Box -->
      <div class="col-12 col-md-6">
        <SalaryFilter />
      </div>

      <!-- Equity Box -->
      <div class="col-12 col-md-6">
        <JobModeFilter />
      </div>
    </div>
  </div>
</template>

<script>
import SalaryFilter from "./SalaryFilter.vue";

import JobModeFilter from "./JobModeFilter.vue";

export default {
  name: "CompensationFilter",
  components: {
    SalaryFilter,
    JobModeFilter,
  },
};
</script>

<style scoped>
.compensation-section {
  margin-top: 30px;
}
</style>
