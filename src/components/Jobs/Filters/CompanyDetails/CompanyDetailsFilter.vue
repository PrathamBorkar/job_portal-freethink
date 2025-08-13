<template>
  <div class="company-details-section q-px-sm">
    <div class="text-h6 q-mb-md">Company Details</div>

    <div class="row q-col-gutter-md">
      <!-- Company Size -->
      <div class="col-12 col-md-6">
        <CompanySizeFilter />
      </div>

      <!-- Company Type -->
      <div class="col-12 col-md-6">
        <CompanyTypeFilter />
      </div>
    </div>
  </div>
</template>

<script>
import CompanySizeFilter from "./CompanySizeFilter.vue";
import CompanyTypeFilter from "./CompanyTypeFilter.vue";

export default {
  name: "CompanyDetailsFilter",
  components: {
    CompanySizeFilter,
    CompanyTypeFilter,
  },
};
</script>

<style scoped>
.company-details-section {
  margin-top: 30px;
}
</style>
