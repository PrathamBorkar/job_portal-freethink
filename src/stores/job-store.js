import axios from 'axios'
import qs from 'qs'
import { defineStore } from 'pinia'
import { useFilterStore } from './filter-store'
import { useUserStore } from 'src/stores/user-store'
export const useJobsStore = defineStore('jobs', {
  state: () => ({
    jobs: [],
    selectedJob: null,
    selectedCompany: null,
    loading: false, // used only for job list fetching
    error: null,
    selectedJobId: null,
    message: '',
    // Dialog visibility states
    applicationDialogVisible: false,
    learnMoreDialogVisible: false,
    companyDialogVisible: false,
  }),

  actions: {
    // Fetch list of jobs with optional similar job filtering
    async fetchJobs({ similarJobs = false, referenceJobId = null } = {}) {
      this.loading = true
      this.error = null
      try {
        let response
        if (similarJobs && referenceJobId) {
          response = await axios.get('http://localhost:3000/jobs/getSimilarJobs', {
            params: { jobid: referenceJobId },
          })
        } else {
          const filterStore = useFilterStore()
          const filters = filterStore.filtersForApi
          response = await axios.get('http://localhost:3000/jobs/getJobs', {
            params: filters,
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
          })
        }
        this.jobs = response.data.jobs || []
      } catch (err) {
        this.error = err.message
        console.error('❌ Job fetch error:', err)
      } finally {
        this.loading = false
      }
    },

    // Fetch detailed info for a single job by jobid
    async fetchJobDetail(jobid) {
      this.error = null
      try {
        const response = await axios.get('http://localhost:3000/jobs/getJobDetail', {
          params: { jobid },
        })
        this.selectedJob = response.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Failed to fetch job detail'
        this.selectedJob = null
      }
      // no loading state change here
    },

    // Fetch detailed info for a single company by cid
    async fetchCompanyDetail(cid) {
      this.error = null
      try {
        const response = await axios.get('http://localhost:3000/company/getCompanyDetail', {
          params: { cid },
        })
        this.selectedCompany = response.data
        console.log('Selected company data:', this.selectedCompany)
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Failed to fetch company detail'
        this.selectedCompany = null
      }
      // no loading state change here
    },

    // Open job application dialog for jobid
    async openApplicationDialog(jobid) {
      console.log('[Store] openApplicationDialog called with jobid:', jobid)
      this.selectedJobId = jobid
      await this.fetchJobDetail(jobid)
      this.applicationDialogVisible = true
      console.log('[Store] applicationDialogVisible set to:', this.applicationDialogVisible)
    },

    // Close job application dialog
    closeApplicationDialog() {
      console.log('[Store] closeApplicationDialog called')
      this.applicationDialogVisible = false
      this.error = null
      console.log('[Store] applicationDialogVisible after close:', this.applicationDialogVisible)
    },

    // Open 'learn more' dialog for jobid
    async openLearnMoreDialog(jobid) {
      console.log('[Store] openLearnMoreDialog called with jobid:', jobid)
      this.learnMoreJobId = jobid
      await this.fetchJobDetail(jobid)
      this.learnMoreDialogVisible = true
      console.log('[Store] learnMoreDialogVisible set to:', this.learnMoreDialogVisible)
    },

    // Close 'learn more' dialog
    closeLearnMoreDialog() {
      console.log('[Store] closeLearnMoreDialog called')
      this.learnMoreDialogVisible = false
      this.learnMoreJobId = null
      this.selectedJob = null
      this.error = null
      console.log('[Store] learnMoreDialogVisible after close:', this.learnMoreDialogVisible)
    },

    // Open company detail dialog for cid
    async openCompanyDialog(cid) {
      console.log('[Store] openCompanyDialog called with cid:', cid)
      await this.fetchCompanyDetail(cid)
      this.companyDialogVisible = true
      console.log('[Store] companyDialogVisible set to:', this.companyDialogVisible)
      console.log('[Store] selectedCompany after fetch:', this.selectedCompany)
    },

    // Close company detail dialog
    closeCompanyDialog() {
      console.log('[Store] closeCompanyDialog called')
      this.companyDialogVisible = false
      this.selectedCompany = null
      this.error = null
      console.log('[Store] companyDialogVisible after close:', this.companyDialogVisible)
    },

    async fetchRecommendedJobs() {
      this.loading = true
      this.message = ''
      this.jobs = []

      try {
        const token = useUserStore().token

        const response = await fetch('http://localhost:3000/jobs/recommended', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          this.message = 'Add some skills to your profile'
        }

        const data = await response.json()
        this.jobs = data.jobs || []

        if (this.jobs.length == 0) {
          this.message = 'No recommended jobs found.'
        }
      } catch (err) {
        this.message = err.message
        console.error('Job fetch error:', err)
      } finally {
        this.loading = false
      }
    },
  },
})
