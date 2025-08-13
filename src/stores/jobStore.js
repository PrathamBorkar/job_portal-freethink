// stores/jobsStore.js
import { defineStore } from 'pinia'
import { useUserStore } from './user-store'

const baseUrl = 'http://localhost:3000/jobs' // Base URL for job-related API endpoints

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    jobs: [
      {
        id: 1,
        title: 'Frontend Engineer',
        company: 'TechCorp',
        jobType: 'Full-time',
        salary: '₹12L - ₹16L',
        location: 'Bangalore, India',
        description: 'We are looking for a skilled frontend engineer to build beautiful UIs...',
        skills: ['Vue.js', 'JavaScript', 'HTML', 'CSS', 'REST APIs'],
        postedAt: '2025-07-20',
      },
      {
        id: 2,
        title: 'Backend Developer',
        company: 'CodeHaus',
        jobType: 'Part-time',
        salary: '₹4L - ₹6L',
        location: 'Remote',
        description: 'Looking for a backend developer to handle RESTful APIs and databases.',
        skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
        postedAt: '2025-07-18',
      },
      {
        id: 3,
        title: 'UI/UX Designer',
        company: 'Designify',
        jobType: 'Contract',
        salary: '₹5L - ₹7L',
        location: 'Mumbai, India',
        description: 'Creative designer needed for wireframes and product design.',
        skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
        postedAt: '2025-07-15',
      },
      {
        id: 4,
        title: 'DevOps Engineer',
        company: 'CloudStack',
        jobType: 'Full-time',
        salary: '₹10L - ₹13L',
        location: 'Hyderabad, India',
        description: 'Implement and manage CI/CD pipelines and cloud infrastructure.',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
        postedAt: '2025-07-10',
      },
      {
        id: 5,
        title: 'Data Scientist',
        company: 'AIWorks',
        jobType: 'Internship',
        salary: '₹3L - ₹5L',
        location: 'Pune, India',
        description: 'Assist in building machine learning models and data pipelines.',
        skills: ['Python', 'Pandas', 'Scikit-learn', 'SQL', 'Data Visualization'],
        postedAt: '2025-07-05',
      },
    ],
    recruiterJobs: [], // ✅ Separate state to store jobs posted by recruiter
    jobStats: {
      total: 0,
      active: 0,
      closed: 0,
      drafts: 0,
    },
    error: null,
  }),

  actions: {
    async postJob(jobData) {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore() // ✅ Add this
        const token = userStore.token || sessionStorage.getItem('token') // ✅ Add this

        if (!token) {
          throw new Error('Authorization token is missing')
        }

        const response = await fetch(`${baseUrl}/CreateJob`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jobData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to post job')
        }

        if (result.data || result.job) {
          this.jobs.unshift(result.data || result.job)
        }

        return {
          success: true,
          message: result.message || 'Job posted successfully',
          data: result.data || result.job,
        }
      } catch (error) {
        this.error = error.message
        console.error('Error posting job:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    async fetchJobs() {
      try {
        const response = await fetch(`${baseUrl}/GetAllJobs`)
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }
        const data = await response.json()
        this.jobs = data.jobs // Assuming the API returns an object with a 'jobs' array
      } catch (error) {
        console.error('Error fetching jobs:', error)
        throw error
      }
    },

    async fetchJobByRecruiter() {
      try {
        const userStore = useUserStore()
        const token = userStore.token || sessionStorage.getItem('token')

        if (!token) {
          throw new Error('Authorization token is missing')
        }

        const response = await fetch(`${baseUrl}/getJobsByRecruiter`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch recruiter jobs')
        }

        this.recruiterJobs = data.jobs
        console.log('Recruiter jobs fetched:', data.jobs)
        return data.jobs
      } catch (error) {
        this.error = error.message
        console.error('Error fetching recruiter jobs:', error)
        throw error
      }
    },

    // ✅ New method to delete a job
    async deleteJob(jobid) {
      try {
        const userStore = useUserStore()
        const token = userStore.token || sessionStorage.getItem('token')

        if (!token) {
          throw new Error('Authorization token is missing')
        }

        const response = await fetch(`${baseUrl}/deleteJob/${jobid}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete job')
        }

        // Remove from local state
        this.recruiterJobs = this.recruiterJobs.filter((job) => job.jobid !== jobid)
        this.jobs = this.jobs.filter((job) => job.id !== jobid)

        console.log('Job deleted successfully')
        return data
      } catch (error) {
        console.error('Error deleting job:', error)
        throw error
      }
    },

    // ✅ New method to update a job
    async updateJob(jobid, updatedJob) {
      try {
        const userStore = useUserStore()
        const token = userStore.token || sessionStorage.getItem('token')

        if (!token) {
          throw new Error('Authorization token is missing')
        }

        const response = await fetch(`${baseUrl}/updateJob/${jobid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedJob),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update job')
        }

        // Update local state
        const jobIndex = this.recruiterJobs.findIndex((job) => job.jobid === jobid)
        if (jobIndex !== -1) {
          this.recruiterJobs[jobIndex] = {
            ...this.recruiterJobs[jobIndex],
            ...updatedJob,
          }
        }

        console.log('Job updated successfully:', result)
        return result
      } catch (error) {
        console.error('Error updating job:', error)
        throw error
      }
    },

    // ✅ New method to get job by ID
    async getJobById(jobid) {
      try {
        const response = await fetch(`${baseUrl}/getJob/${jobid}`)

        if (!response.ok) {
          throw new Error('Failed to fetch job')
        }

        const data = await response.json()
        return data.job
      } catch (error) {
        console.error('Error fetching job by ID:', error)
        throw error
      }
    },

    // ✅ New method to fetch job statistics by recruiter
    async fetchJobStatsByRecruiter() {
      try {
        const userStore = useUserStore()
        const token = userStore.token || sessionStorage.getItem('token')

        if (!token) {
          throw new Error('Authorization token is missing')
        }

        const response = await fetch(`${baseUrl}/getTotalJobsByRecruiter`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch job statistics')
        }

        this.jobStats = data.stats || {
          total: data.total || 0,
          active: data.active || 0,
          closed: data.closed || 0,
          drafts: data.drafts || 0,
        }

        console.log('Job statistics fetched:', this.jobStats)
        return this.jobStats
      } catch (error) {
        this.error = error.message
        console.error('Error fetching job statistics:', error)
        throw error
      }
    },
  },
})
