<template>
  <q-dialog
    v-model="showDialog"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    persistent
    @hide="closeDialog"
  >
    <q-card flat bordered class="q-pa-lg dialog-card">
      <!-- ❌ Close icon -->
      <q-btn icon="close" flat round dense color="grey-6" class="close-icon" @click="closeDialog" />

      <div v-if="job" class="scroll">
        <div class="centered-div">
          <!-- Wrapper: First card + side card -->
          <div class="row justify-center no-wrap q-gutter-md">
            <!-- First Card -->
            <q-card class="stacked-card" flat bordered>
              <div class="row no-wrap">
                <div class="col q-pa-lg">
                  <!-- Top Section -->
                  <div class="row justify-between items-start q-mb-lg">
                    <div class="row items-center q-gutter-lg">
                      <q-avatar size="80px" class="custom-logo-avatar">
                        <img :src="job.logo" />
                      </q-avatar>
                      <div>
                        <div class="company-name">{{ job.name }}</div>
                        <div v-if="job.hiringStatus" class="custom-chip custom-chip-black q-mt-sm">
                          {{ job.hiringStatus }}
                        </div>
                        <div class="company-size">{{ job.size }}</div>
                        <div class="row q-gutter-sm q-mt-sm">
                          <div
                            v-for="(tag, i) in job.companyTags"
                            :key="i"
                            class="custom-chip custom-chip-pink"
                          >
                            {{ tag }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Title & Meta -->
                  <div>
                    <div class="job-title">{{ job.title }}</div>
                    <div class="job-meta">
                      ₹{{ job.salary }} &nbsp;|&nbsp; {{ job.experience }} &nbsp;|&nbsp;
                      {{ job.type }}
                    </div>
                    <div class="job-posted">
                      Posted: {{ job.posted }} &nbsp;•&nbsp; Recruiter recently active
                    </div>
                  </div>

                  <q-separator spaced class="q-my-lg" />

                  <!-- Grid Info -->
                  <div class="row q-col-gutter-lg">
                    <div class="info-col">
                      <div class="text-caption text-grey-7">Job Location</div>
                      <div class="text-body1">{{ job.jobLocation }}</div>
                    </div>
                    <div class="info-col">
                      <div class="text-caption text-grey-7">Industry</div>
                      <div class="text-body1">{{ job.industry }}</div>
                    </div>
                    <div class="info-col">
                      <div class="text-caption text-grey-7">Work Policy</div>
                      <div class="text-body1">{{ job.remotePolicy }}</div>
                    </div>
                    <div class="info-col">
                      <div class="text-caption text-grey-7">Openings</div>
                      <div class="text-body1">{{ job.openings }}</div>
                    </div>
                    <div class="info-col">
                      <div class="text-caption text-grey-7">Education Requirement</div>
                      <div class="text-body1">{{ job.education }}</div>
                    </div>
                    <div class="info-col">
                      <div class="text-caption text-grey-7">Skills</div>
                      <div class="row q-gutter-sm q-mt-sm">
                        <div
                          v-for="(skill, i) in job.skills"
                          :key="i"
                          class="custom-chip custom-chip-blue"
                        >
                          {{ skill }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card>

            <!-- Side Card -->
            <q-card flat bordered class="apply-card q-pa-none">
              <div class="apply-header">Apply to {{ job.name }}</div>
              <div class="apply-body">
                <p class="apply-text">
                  Please make any changes to your profile as this information
                  <strong>will be sent to recruiters</strong>.
                  <router-link to="/profile" class="apply-link">Go to your profile</router-link>
                  to update it.
                </p>
                <div class="apply-warning" v-if="missingCriticalInfo.length">
                  <strong
                    >You cannot apply to this job because your profile is missing the following
                    critical pieces of information {{ job.name }} uses to evaluate
                    applicants.</strong
                  >
                  <ul>
                    <li v-for="item in missingCriticalInfo" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </div>
                <div class="apply-question">What interests you about working for this company?</div>
                <textarea
                  v-model="coverLetter"
                  class="apply-textarea"
                  placeholder="Write your cover letter here..."
                ></textarea>
                <button class="apply-button" :disabled="applyDisabled" @click="applyForJob">
                  Apply
                </button>
              </div>
            </q-card>
          </div>

          <!-- Second Card - About the Job -->
          <div class="row q-mt-md">
            <q-card class="about-job-card q-pa-xl">
              <div class="column q-gutter-lg">
                <div>
                  <div class="about-job-title">About the Job</div>
                  <div class="about-job-text">{{ job.description }}</div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </div>

      <div v-else class="q-pa-md">Loading job details...</div>
    </q-card>
  </q-dialog>
</template>
<script>
import { computed, ref } from 'vue'
import { useJobsStore } from 'src/stores/job-store'
import { useUserStore } from 'src/stores/user-store'

export default {
  name: 'TwoCardDialog',
  components: {},
  setup() {
    const jobsStore = useJobsStore()
    const userStore = useUserStore()

    const showDialog = computed({
      get: () => jobsStore.learnMoreDialogVisible,
      set: (val) => {
        if (!val) jobsStore.closeLearnMoreDialog()
      },
    })

    const coverLetter = ref('')

    const job = computed(() => {
      const rawJob = jobsStore.selectedJob
      if (!rawJob) return null

      return {
        logo: rawJob.logo || 'https://via.placeholder.com/64',
        name: rawJob.company_name || 'Unknown Company',
        hiringStatus: rawJob.company_status || null,
        size: rawJob.companySize || 'Unknown size',
        companyTags: Array.isArray(rawJob.company_tags) ? rawJob.company_tags : [],
        title: rawJob.custom_title || rawJob.job_roles || '',
        salary:
          rawJob.salary_min && rawJob.salary_max
            ? `${rawJob.salary_min.toLocaleString()} - ${rawJob.salary_max.toLocaleString()}`
            : 'Not specified',
        experience:
          rawJob.experience_min && rawJob.experience_max
            ? `${rawJob.experience_min} - ${rawJob.experience_max} yrs`
            : 'N/A',
        type: rawJob.job_type || '',
        posted: rawJob.posted ? new Date(rawJob.posted).toLocaleDateString() : 'N/A',
        jobLocation: rawJob.locations || 'N/A',
        industry: rawJob.markets || 'N/A',
        remotePolicy: rawJob.mode_of_work || 'N/A',
        openings: rawJob.opening || 0,
        education: rawJob.qualification_name || 'N/A',
        skills: rawJob.skills ? rawJob.skills.split(',').map((s) => s.trim()) : [],
        description: rawJob.bigDescription || '',
      }
    })

    // ✅ Added computed to fix error
    const jobDetail = computed(() => jobsStore.selectedJob || null)

    const missingCriticalInfo = computed(() => {
      const missing = []
      if (!userStore.education_level || userStore.education_level.trim() === '')
        missing.push('Education Level')
      if (
        !userStore.skills ||
        (Array.isArray(userStore.skills)
          ? userStore.skills.length === 0
          : userStore.skills.trim() === '')
      )
        missing.push('Skills')
      if (!userStore.degree || userStore.degree.trim() === '') missing.push('Degree')
      return missing
    })

    const applyDisabled = computed(() => missingCriticalInfo.value.length > 0)

    async function applyForJob() {
      if (!jobsStore.selectedJob?.jobid) {
        console.error('No job selected for application')
        return
      }
      console.log(
        'Applying for job',
        jobsStore.selectedJob.jobid,
        'with cover letter:',
        coverLetter.value,
      )
      await jobsStore.openApplicationDialog(jobsStore.selectedJob.jobid)
    }

    function closeDialog() {
      jobsStore.closeLearnMoreDialog()
    }

    return {
      showDialog,
      job,
      jobDetail, // ✅ Already added return
      closeDialog,
      coverLetter,
      applyDisabled,
      applyForJob,
      missingCriticalInfo,
    }
  },
}
</script>

<style scoped>
.dialog-card {
  width: 100vw;
  height: 80vh;
  max-width: 100vw;
  border-radius: 20px; /* Rounded edges for dialog */
  position: relative;
}

.scroll {
  height: 100%;
  overflow-y: auto;
}

.centered-div {
  width: 80%;
  margin: 0 auto;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stacked-card {
  width: 70%;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #ccc;
}

.custom-logo-avatar {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background-color: white;
  padding: 6px;
}

.company-name {
  font-size: 22px;
  font-weight: 700;
}

.company-size {
  font-size: 15px;
  color: #6e6e73;
  margin-top: 6px;
}

.custom-chip {
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  padding: 5px 14px;
}

.custom-chip-pink {
  border: 1px solid #ff4c61;
  background-color: #fff1f3;
}

.custom-chip-black {
  border: 1px solid #28a745;
  background-color: #e6f4ea;
}

/* New blue chip for skills */
.custom-chip-blue {
  border: 1px solid #2a6fdb;
  background-color: #e6f0ff;
  color: #1b3a8a;
}

.info-col {
  width: calc(50% - 8px);
}

.job-title {
  font-size: 30px;
  font-weight: 700;
}

.job-meta {
  font-size: 16px;
}

.job-posted {
  font-size: 16px;
  color: #6e6e73;
}

.close-icon {
  position: absolute;
  top: 8px;
  right: 8px;
}

.apply-card {
  flex: 0 0 320px;
  background: white;
  border-radius: 16px;
  border: 1px solid #ccc;
}

.apply-header {
  background-color: black;
  color: white;
  font-size: 18px;
  font-weight: bold;
  padding: 12px 16px;
}

.apply-body {
  padding: 16px;
}

.apply-text {
  font-size: 14px;
  margin-bottom: 12px;
}

.apply-link {
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
}

.apply-warning {
  background-color: #ffe6e6;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  color: #d60000;
  margin-bottom: 16px;
}

.apply-textarea {
  width: 100%;
  height: 60px;
  border-radius: 6px;
  border: 1px solid #ccc;
  padding: 8px;
  margin-bottom: 12px;
  resize: none;
}

.apply-button {
  width: 100%;
  background-color: black;
  color: white;
  border: none;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
}

.apply-button:disabled {
  background-color: #bbb;
  cursor: not-allowed;
}

/* About Job Section Styling */
.about-job-card {
  width: 100%;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #ccc;
}

.about-job-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
}

.about-job-text {
  font-size: 17px;
  line-height: 1.6;
  color: #333;
}

@media (max-width: 1024px) {
  .stacked-card {
    width: 100%;
  }
  .apply-card {
    display: none;
  }
}
</style>
