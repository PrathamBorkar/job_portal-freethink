<template>
  <div class="q-pa-md">
    <TopSection />
    <div class="row items-center justify-between q-mb-md">
      <h2 class="text-h4 text-primary">Recommended Jobs</h2>
      <q-btn label="View All" flat dense no-caps class="text-primary" @click="goToJobs" />
    </div>

    <div v-if="jobsStore.loading" class="text-center q-mt-lg">
      <q-spinner size="md" color="primary" />
    </div>

    <div v-else-if="jobsStore.message !== ''" class="text-grey">
      {{ jobsStore.message }}
    </div>

    <div class="q-gutter-md">
      <JobList />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from 'src/stores/job-store'

import TopSection from './TopSection/TopSection.vue'
import JobList from '../Jobs/JobList.vue'

const jobsStore = useJobsStore()
const router = useRouter()

onMounted(() => {
  jobsStore.fetchRecommendedJobs()
})

const goToJobs = () => {
  router.push('/all-jobs')
}
</script>

<style scoped>
h2 {
  font-weight: bold;
}
</style>
