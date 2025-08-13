<template>
  <div class="q-mx-auto" style="padding-top: 100px; width: 80vw">
    <JobHeader />
    <!-- Add padding/margin below SavedSearchSection -->
    <div class="q-mb-md">
      <SavedSearchSection />
    </div>

    <JobFilterCard v-model="showFilter" />
    <JobList mode="default" />

    <!-- This will render JobDialog when /jobs/:id is active -->
    <router-view />

    <!-- Add the ApplicationDialog here -->
    <JobApplication />

    <!-- Add the TwoCardDialog here for job detail dialog -->
    <JobDetails />
    <CompanyDetails />
  </div>
</template>

<script>
import JobFilterCard from 'src/components/Jobs/JobFilterCard.vue'
import JobHeader from 'src/components/Jobs/JobHeader.vue'
import JobList from 'src/components/Jobs/JobList.vue'
import SavedSearchSection from 'src/components/Jobs/SavedSearchSection.vue'
import JobApplication from 'src/components/Jobs/JobApplication.vue'
import JobDetails from 'src/components/Jobs/JobDetails.vue'
import CompanyDetails from 'src/components/Jobs/CompanyDetails.vue'

export default {
  name: 'JobDashboard',
  components: {
    JobFilterCard,
    JobList,
    SavedSearchSection,
    JobHeader,
    JobApplication,
    JobDetails,
    CompanyDetails,
  },
  data() {
    return {
      showFilter: false,
    }
  },
}
</script>
