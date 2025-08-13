<template>
  <q-dialog v-model="jobsStore.applicationDialogVisible" persistent>
    <q-card flat bordered class="application-card">
      <div class="row no-wrap" v-if="normalizedJob">
        <!-- Left Column -->
        <div class="col-4 left-col">
          <div class="company-header q-mb-md">
            <q-avatar size="48px" class="q-mr-sm">
              <img :src="normalizedJob.logo || placeholderLogo" alt="Company Logo" />
            </q-avatar>
            <div>
              <div class="text-h6">{{ normalizedJob.name }}</div>
              <div v-if="normalizedJob.hiringStatus" class="text-caption text-primary q-mt-xs">
                {{ normalizedJob.hiringStatus }}
              </div>
              <div class="text-caption q-mt-xs">{{ normalizedJob.size }}</div>
            </div>
          </div>

          <div class="text-subtitle1 text-weight-medium q-mb-xs">
            {{ normalizedJob.title }}
          </div>
          <div class="text-body2 text-grey-7 q-mb-sm">₹{{ normalizedJob.salary }}</div>

          <q-separator spaced />

          <div class="info-row q-mb-xs">
            <strong>Location:</strong> {{ normalizedJob.location }}
          </div>
          <div class="info-row q-mb-xs">
            <strong>Experience:</strong> {{ normalizedJob.experience }}
          </div>
          <div class="info-row q-mb-xs"><strong>Job Type:</strong> {{ normalizedJob.type }}</div>
          <div class="info-row q-mb-xs"><strong>Posted:</strong> {{ normalizedJob.posted }}</div>

          <q-separator spaced />

          <div class="text-weight-medium q-mt-sm">Company Location</div>
          <div>{{ normalizedJob.companyLocation }}</div>

          <div class="text-weight-medium q-mt-sm">Industry</div>
          <div>{{ normalizedJob.industry }}</div>

          <div class="text-weight-medium q-mt-sm">Remote Policy</div>
          <div>{{ normalizedJob.remotePolicy }}</div>

          <div class="text-weight-medium q-mt-sm">Openings</div>
          <div>{{ normalizedJob.openings }}</div>

          <div class="text-weight-medium q-mt-sm">Education Requirement</div>
          <div>{{ normalizedJob.education }}</div>

          <div class="text-weight-medium q-mt-sm">Skills</div>
          <div class="row wrap q-gutter-xs q-mt-xs">
            <q-chip
              v-for="(skill, index) in normalizedJob.skills"
              :key="index"
              size="sm"
              outline
              color="grey-7"
              class="bg-grey-3"
            >
              {{ skill }}
            </q-chip>
          </div>
        </div>

        <!-- Right Column -->
        <div class="col right-col">
          <div class="text-body1 q-mb-sm">
            Please make any changes to your profile as this information
            <strong>will be sent to recruiters</strong>.
            <router-link to="/profile" class="text-primary q-ml-xs">Go to your profile</router-link>
            to update it.
          </div>

          <div v-if="missingCriticalInfo.length" class="error-box q-mb-lg">
            <div>
              You cannot apply to this job because your profile is missing the following critical
              pieces of information
              {{ normalizedJob.name }} uses to evaluate applicants.
            </div>
            <ul class="q-my-sm q-pl-lg">
              <li v-for="(item, idx) in missingCriticalInfo" :key="idx">
                {{ item }}
              </li>
            </ul>
            <div>
              Please apply again after you fill in those details. Applicants with filled in profiles
              are <strong>42% more likely</strong> to get responses.
            </div>
          </div>

          <div class="text-body1 q-mb-sm">
            <strong>What interests you about working for this company?</strong>
          </div>
          <q-input
            type="textarea"
            outlined
            v-model="interest"
            dense
            :style="{ width: '100%', height: '140px' }"
          />

          <div class="row justify-end q-mt-lg">
            <q-btn flat label="Cancel" color="grey-8" @click="closeDialog" />
            <q-btn
              unelevated
              label="Send application"
              color="primary"
              class="q-ml-sm"
              :disable="!canApply"
              @click="sendApplication"
            />
          </div>
        </div>
      </div>

      <div v-else class="q-pa-md">Loading job details...</div>
    </q-card>
  </q-dialog>
</template>

<script>
import { useJobsStore } from '../../stores/job-store'
import { useUserStore } from '../../stores/user-store'

export default {
  name: 'ApplicationDialog',
  data() {
    return {
      interest: '',
      placeholderLogo: 'https://via.placeholder.com/48?text=No+Logo',
    }
  },
  computed: {
    jobsStore() {
      return useJobsStore()
    },
    userStore() {
      return useUserStore()
    },
    normalizedJob() {
      const job = this.jobsStore.selectedJob
      if (!job) return null

      return {
        name: job.company_name || job.custom_title || 'Unknown Company',
        logo: job.logo || null,
        size: job.companySize || 'N/A',
        title: job.custom_title || job.job_roles || 'Job Title',
        salary:
          job.salary_min && job.salary_max
            ? `${(job.salary_min / 1000).toFixed(1)}K – ${(job.salary_max / 1000).toFixed(1)}K`
            : 'Not specified',
        location: job.locations || 'Not specified',
        experience: job.experience_max
          ? `${job.experience_min || 0} – ${job.experience_max} years`
          : 'Not specified',
        type: job.job_type || 'Not specified',
        posted: job.posted ? new Date(job.posted).toLocaleDateString() : 'Unknown',
        companyLocation: job.company_location || 'Not specified',
        industry: job.markets || 'Not specified',
        remotePolicy: job.mode_of_work || 'Not specified',
        openings: job.opening || 0,
        education: job.qualification_name || 'Not specified',
        skills: job.skills ? job.skills.split(',').map((s) => s.trim()) : [],
        missingFields: job.missingFields || [],
        hiringStatus: job.hiring_status || '',
      }
    },
    missingCriticalInfo() {
      const missing = []
      const { skills, degree } = this.userStore

      if (!skills || (Array.isArray(skills) ? skills.length === 0 : skills.trim() === ''))
        missing.push('Skills')
      if (!degree || degree.trim() === '') missing.push('Degree')

      return missing
    },
    canApply() {
      const job = this.normalizedJob
      return (
        (!job?.missingFields || job.missingFields.length === 0) &&
        this.missingCriticalInfo.length === 0
      )
    },
  },
  methods: {
    closeDialog() {
      this.jobsStore.closeApplicationDialog()
      this.interest = ''
    },
    async sendApplication() {
      if (!this.canApply) return

      const jobid = this.jobsStore.selectedJob?.jobid
      if (!jobid) {
        console.error('No job ID found to apply.')
        return
      }

      try {
        const result = await this.userStore.applyForJob(jobid)
        if (result.success) {
          console.log('Application successful')
          this.closeDialog()
        } else {
          console.error('Application failed:', result.message)
        }
      } catch (error) {
        console.error('Error applying for job:', error)
      }
    },
  },
}
</script>

<style scoped>
.application-card {
  max-width: 780px;
  width: 780px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.left-col {
  background-color: #f8f9fa;
  padding: 16px;
}

.right-col {
  padding: 24px;
}

.company-header {
  display: flex;
  align-items: center;
}

.info-row {
  font-size: 14px;
  margin-bottom: 6px;
}

.error-box {
  background-color: #f8d7da;
  color: #842029;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
}
</style>
