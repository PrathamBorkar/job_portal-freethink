<template>
  <div class="q-pa-lg applicants-section">
    <div v-if="currentJob == null && component == 'jobs-list'">
      <div v-for="job in jobs" :key="job.id">
        <q-card class="job-card q-my-md" flat>
          <!-- Header Section -->
          <q-card-section class="card-header">
            <div class="header-content">
              <div class="title-section">
                <h5 class="job-title">{{ job.title }}</h5>
                <div class="job-badges">
                  <q-badge class="job-badge" :label="job.job_type" />
                  <q-badge class="job-badge work-mode" :label="job.mode_of_work" />
                </div>
              </div>
              <div class="header-actions">
                <q-btn
                  round
                  flat
                  icon="visibility"
                  class="icon-btn"
                  @click="changeComponent('view-job', job)"
                >
                  <q-tooltip>View Job</q-tooltip>
                </q-btn>
                <q-btn
                  round
                  flat
                  icon="group"
                  class="icon-btn"
                  @click="changeComponent('job-app', job)"
                >
                  <q-tooltip>View Applications</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <!-- Main Content -->
          <q-card-section class="card-content">
            <div class="info-grid">
              <div class="info-card">
                <div class="info-icon"><q-icon name="work_history" /></div>
                <div class="info-content">
                  <div class="info-label">Experience (MAX - MIN)</div>
                  <div class="info-value">{{ job.experience_max - job.experience_min }} years</div>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon"><q-icon name="payments" /></div>
                <div class="info-content">
                  <div class="info-label">Salary Level</div>
                  <div class="info-value">{{ job.salary_max - job.salary_min }}</div>
                </div>
              </div>

              <div class="info-card" v-if="job.opening">
                <div class="info-icon"><q-icon name="mail" /></div>
                <div class="info-content">
                  <div class="info-label">Openings</div>
                  <div class="info-value">{{ job.opening }} positions</div>
                </div>
              </div>

              <div class="info-card" v-if="job.popularity_score > 0">
                <div class="info-icon">
                  <q-icon name="local_fire_department" />
                </div>
                <div class="info-content">
                  <div class="info-label">Popularity</div>
                  <div class="info-value">{{ job.popularity_score }} score</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Footer -->
          <q-card-section class="card-footer">
            <div class="footer-content">
              <q-icon name="schedule" class="footer-icon" />
              <span class="posted-text">Posted {{ getTimeAgo(job.posted) }}</span>
              <q-space />
              <div class="status-indicator">
                <div class="status-dot active"></div>
                <span class="status-text">Active</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <JobApplicants
      v-if="currentJob !== null && component == 'job-app'"
      :job-details="currentJob"
      :go-back="goBack"
    />

    <ViewJob
      v-if="currentJob !== null && component == 'view-job'"
      :job="currentJob"
      :go-back="goBack"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useJobsStore } from 'src/stores/jobStore'
import ViewJob from './ViewJob.vue'
import JobApplicants from './JobApplicants.vue'

const jobsStore = useJobsStore()
const jobs = ref([])
const component = ref('jobs-list')
const currentJob = ref(null)

const loadJobs = async () => {
  try {
    jobs.value = await jobsStore.fetchJobByRecruiter()
    console.log('Jobs loaded:', jobsStore.recruiterJobs)
  } catch (error) {
    console.error('Error loading jobs:', error)
  }
}

function getTimeAgo(dateString) {
  const now = new Date()
  const posted = new Date(dateString)
  const diffTime = Math.abs(now - posted)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}

function changeComponent(val, curr) {
  component.value = val
  currentJob.value = curr
}

function goBack() {
  currentJob.value = null
  component.value = 'jobs-list'
}

onMounted(() => {
  loadJobs()
})
</script>

<style scoped>
.applicants-section {
  width: 100%;
}

.q-item {
  border-radius: 8px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.job-card {
  border-radius: 20px;
  border: 1px solid #e8e8e8;
  background: white;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.job-card:hover {
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  border-color: #d0d0d0;
}

/* Header Section */
.card-header {
  background: linear-gradient(135deg, #000000 0%, #2d2d2d 100%);
  padding: 16px;
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.title-section {
  flex: 1;
}

.job-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  line-height: 1.1;
}

.job-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.job-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.job-badge.work-mode {
  background: rgba(255, 255, 255, 0.15);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  width: 40px;
  height: 40px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Main Content Grid */
.card-content {
  padding: 16px;
  background: white;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  border-color: #e0e0e0;
}

.info-icon {
  width: 36px;
  height: 36px;
  background: black;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.85rem;
  color: #2c2c2c;
  font-weight: 700;
}

/* Footer Section */
.card-footer {
  padding: 12px 16px;
  background: #f9f9f9;
  border-top: 1px solid #f0f0f0;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-icon {
  color: #666;
  font-size: 1rem;
}

.posted-text {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-dot.active {
  background: #4caf50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.status-text {
  color: #4caf50;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    align-self: flex-end;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .job-title {
    font-size: 1.3rem;
  }

  .card-content {
    padding: 24px 16px;
  }

  .card-header {
    padding: 20px 16px;
  }

  .card-footer {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .info-card {
    padding: 16px;
  }

  .info-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .footer-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .status-indicator {
    align-self: flex-end;
  }
}
</style>
