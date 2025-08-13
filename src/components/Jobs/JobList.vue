<template>
  <div class="job-list-wrapper">
    <div v-if="loading">Loading jobs...</div>
    <div v-else-if="error">Error loading jobs.</div>
    <div v-else-if="jobs.length === 0">No jobs found.</div>
    <div v-else class="job-list">
      <JobCard v-for="job in jobs" :key="job.id" :job="job" v-once />
    </div>
  </div>
</template>

<script>
import JobCard from './JobCard.vue'
import { useJobsStore } from 'src/stores/job-store'
import { useFilterStore } from 'src/stores/filter-store'
import debounce from 'lodash.debounce'

export default {
  name: 'JobList',
  components: { JobCard },

  data() {
    return {
      debouncedFetchJobs: null,
    }
  },

  computed: {
    jobsStore() {
      return useJobsStore()
    },
    filterStore() {
      return useFilterStore()
    },
    jobs() {
      return this.jobsStore.jobs
    },
    loading() {
      return this.jobsStore.loading
    },
    error() {
      return this.jobsStore.error
    },
    filtersForFetch() {
      return this.filterStore.filtersForApi || {}
    },
  },

  created() {
    this.debouncedFetchJobs = debounce(() => {
      this.jobsStore.fetchJobs({ filters: this.filtersForFetch })
    }, 300)

    this.debouncedFetchJobs()
  },

  watch: {
    filtersForFetch: {
      deep: true,
      handler() {
        if (this.debouncedFetchJobs) {
          this.debouncedFetchJobs()
        }
      },
    },
  },
}
</script>
