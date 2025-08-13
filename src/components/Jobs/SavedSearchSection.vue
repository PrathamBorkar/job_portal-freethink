<template>
  <div class="full-width-wrapper">
    <q-card flat bordered class="q-pa-md bg-white full-width-card">
      <!-- Job Title and Location Fields -->
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <JobTitleFilter />
        </div>
        <div class="col-6">
          <LocationRegionFilter />
        </div>
      </div>

      <!-- Selected Tags -->
      <div class="q-mt-sm">
        <SelectedTags />
      </div>

      <!-- Separator -->
      <q-separator class="q-my-md" color="grey-4" size="1px" />

      <!-- Filters Button Centered -->
      <div class="row justify-center">
        <q-btn
          outline
          color="primary"
          class="text-weight-medium"
          icon-right="expand_more"
          label="Filters"
          @click="showFilter = !showFilter"
        />
      </div>
    </q-card>

    <!-- Filter Dialog (conditionally rendered) -->
    <JobFilterCard v-model="showFilter" />
  </div>
</template>
<script>
import { useFilterStore } from "src/stores/filter-store"; // adjust path as needed
import JobTitleFilter from "./Filters/BasicFilter/JobRoleFilter.vue";
import LocationRegionFilter from "./Filters/BasicFilter/LocationRegionFilter.vue";
import SelectedTags from "./SelectedTags.vue";
import JobFilterCard from "./JobFilterCard.vue";

export default {
  name: "SavedSearchSection",
  components: {
    JobTitleFilter,
    LocationRegionFilter,
    SelectedTags,
    JobFilterCard,
  },
  data() {
    return {
      showFilter: false,
    };
  },
  setup() {
    const filterStore = useFilterStore();
    return { filterStore };
  },
  mounted() {
    this.filterStore.fetchFilters();
  },
};
</script>


<style scoped>
.full-width-wrapper {
  width: 100%; /* fill the parent */
  margin: 0 auto; /* center if narrower than parent */
  padding: 0;
}

.full-width-card {
  width: 100%; /* take full space of wrapper */
  border-radius: 0;
}
</style>
