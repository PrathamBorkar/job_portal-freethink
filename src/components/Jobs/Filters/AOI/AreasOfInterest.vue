<template>
  <div class="areas-section">
    <div class="text-h6 q-mb-md">Areas of Interest</div>

    <div class="row q-col-gutter-md">
      <!-- Skills Filter -->
      <div class="col-12 col-md-6">
        <SkillsFilter />
      </div>

      <!-- Markets Filter -->
      <div class="col-12 col-md-6">
        <MarketsFilter />
      </div>
    </div>
  </div>
</template>

<script>
import SkillsFilter from "./SkillsFilter.vue";
import MarketsFilter from "./MarketsFilter.vue";

export default {
  name: "AreasOfInterest",
  components: {
    SkillsFilter,
    MarketsFilter,
  },
};
</script>

<style scoped>
.areas-section {
  margin-top: 30px;
}
</style>
