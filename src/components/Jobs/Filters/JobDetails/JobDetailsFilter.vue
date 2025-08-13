<template>
  <div class="job-details-section">
    <div class="text-h6 q-mb-md">Job Details</div>

    <div class="row q-col-gutter-md">
      <!-- Job Types -->
      <div class="col-12 col-md-6">
        <JobTypeFilter />
      </div>

      <!-- Required Experience -->
      <div class="col-12 col-md-6">
        <ExperienceFilter />
      </div>
    </div>
  </div>
</template>

<script>
import JobTypeFilter from "./JobTypeFilter.vue";
import ExperienceFilter from "./ExperienceFilter.vue";

export default {
  name: "JobDetailsFilter",
  components: {
    JobTypeFilter,
    ExperienceFilter,
  },
};
</script>

<style scoped>
.job-details-section {
  margin-top: 30px;
}
</style>
