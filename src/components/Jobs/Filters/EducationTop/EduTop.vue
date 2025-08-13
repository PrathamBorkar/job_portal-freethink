<template>
  <div class="edu-top-section">
    <div class="text-h6 q-mb-md">Education & Top Companies</div>

    <div class="row q-col-gutter-md">
      <!-- Education Filter -->
      <div class="col-12 col-md-6">
        <EducationFilter />
      </div>

      <!-- Top Companies Filter -->
      <div class="col-12 col-md-6">
        <TopCompaniesFilter />
      </div>
    </div>
  </div>
</template>

<script>
import EducationFilter from "./EducationFilter.vue";
import TopCompaniesFilter from "./TopCompaniesFilter.vue";

export default {
  name: "EduTop",
  components: {
    EducationFilter,
    TopCompaniesFilter,
  },
};
</script>

<style scoped>
.edu-top-section {
  margin-top: 30px;
}
</style>
