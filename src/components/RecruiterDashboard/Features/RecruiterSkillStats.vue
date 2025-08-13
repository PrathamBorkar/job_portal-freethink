<template>
  <!-- Skills Analytics Charts - Side by Side -->
  <div class="skills-section q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Job Skills Required Chart -->
      <div class="col-12 col-md-6">
        <q-card class="chart-card-enhanced">
          <q-card-section>
            <div class="chart-header">
              <div class="text-h6">Job Skills Required</div>
              <div class="text-caption text-grey-6">Skills demand in job postings (All Time)</div>
            </div>
            <div class="skills-chart-container">
              <canvas ref="jobSkillsChartCanvas" v-if="!isLoadingSkills"></canvas>
              <div v-else class="loading-container">
                <q-spinner-dots size="50px" color="primary" />
                <div class="text-caption q-mt-sm">Loading job skills data...</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Applicant Skills Available Chart -->
      <div class="col-12 col-md-6">
        <q-card class="chart-card-enhanced">
          <q-card-section>
            <div class="chart-header">
              <div class="text-h6">Applicant Skills Available</div>
              <div class="text-caption text-grey-6">
                Skills competency among applicants (All Time)
              </div>
            </div>
            <div class="skills-chart-container">
              <canvas ref="applicantSkillsChartCanvas" v-if="!isLoadingSkills"></canvas>
              <div v-else class="loading-container">
                <q-spinner-dots size="50px" color="orange" />
                <div class="text-caption q-mt-sm">Loading applicant skills data...</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()
const token = userStore.token || sessionStorage.getItem('token')

// Chart refs
const jobSkillsChartCanvas = ref(null)
const applicantSkillsChartCanvas = ref(null)

// Loading states
const isLoadingSkills = ref(false)

// Set larger chart sizes after mount
function setLargeChartSizes() {
  if (jobSkillsChartCanvas.value) {
    jobSkillsChartCanvas.value.width = 700
    jobSkillsChartCanvas.value.height = 500
  }
  if (applicantSkillsChartCanvas.value) {
    applicantSkillsChartCanvas.value.width = 700
    applicantSkillsChartCanvas.value.height = 500
  }
}

// Import Chart.js library
import Chart from './charts.js'
let applicantSkillsChartInstance = null
let jobSkillsChartInstance = null

// Skills data - will be populated dynamically from API
const skillsData = ref({
  jobSkills: [],
  jobCounts: [],
  applicantSkills: [],
  applicantCounts: [],
})

// API Integration for Skills Data
const fetchSkillsData = async () => {
  isLoadingSkills.value = true
  try {
    // Fetch job skills required data
    const [jobSkillsResponse, applicantSkillsResponse] = await Promise.all([
      fetch('http://localhost:3000/skills/count-job-skills', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch('http://localhost:3000/skills/count-app-skills', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
    ])

    if (!jobSkillsResponse.ok || !applicantSkillsResponse.ok) {
      throw new Error('Failed to fetch skills data')
    }

    const jobData = await jobSkillsResponse.json()
    const applicantData = await applicantSkillsResponse.json()

    // Process job skills data - use all skills from the API response
    const jobSkills = Object.keys(jobData.data || {})
    const jobCounts = Object.values(jobData.data || {})

    // Process applicant skills data - use all skills from the API response
    const applicantSkills = Object.keys(applicantData.data || {})
    const applicantCounts = Object.values(applicantData.data || {})

    // Update skills data with processed API response
    skillsData.value = {
      jobSkills,
      jobCounts,
      applicantSkills,
      applicantCounts,
    }

    // Recreate charts with new data
    await nextTick()
    createJobSkillsChart()
    createApplicantSkillsChart()
  } catch (error) {
    console.error('Error fetching skills data:', error)
    generateFallbackSkillsData()
  } finally {
    isLoadingSkills.value = false
  }
}

const generateFallbackSkillsData = () => {
  // Fallback data structure matching the API response format
  const allPossibleSkills = [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'C++',
    'CSS',
    'HTML',
    'TypeScript',
    'Vue.js',
    'Angular',
    'Docker',
    'AWS',
    'SQL',
    'MongoDB',
    'MySQL',
    'PostgreSQL',
    'Git',
  ]

  // Generate random counts for fallback data
  const jobCounts = allPossibleSkills.map(() => Math.floor(Math.random() * 10))
  const applicantCounts = allPossibleSkills.map((count) =>
    Math.max(0, count - Math.floor(Math.random() * 3)),
  )

  skillsData.value = {
    jobSkills: allPossibleSkills,
    jobCounts,
    applicantSkills: allPossibleSkills,
    applicantCounts,
  }

  // Recreate charts with fallback data
  createJobSkillsChart()
  createApplicantSkillsChart()
}

const refreshSkillsData = () => {
  fetchSkillsData()
}

// Chart creation functions using Chart.js
function createJobSkillsChart() {
  if (!jobSkillsChartCanvas.value) return

  // Destroy previous instance if exists
  if (jobSkillsChartInstance) {
    jobSkillsChartInstance.destroy()
  }

  const { jobSkills, jobCounts } = skillsData.value

  // Limit to 15 skills for better visualization
  const displaySkills = jobSkills.slice(0, 15)
  const displayCounts = jobCounts.slice(0, 15)

  jobSkillsChartInstance = new Chart(jobSkillsChartCanvas.value, {
    type: 'bar', // Changed to bar chart for better count visualization
    data: {
      labels: displaySkills,
      datasets: [
        {
          label: 'Job Skills Required (Count)',
          data: displayCounts,
          backgroundColor: 'rgba(25, 118, 210, 0.7)',
          borderColor: '#1976D2',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: { display: true, text: 'Job Skills Required' },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`
            },
          },
        },
      },
      scales: {
        y: {
          title: { display: true, text: 'Demand (Count)' },
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          grid: {
            drawOnChartArea: true,
            color: '#e0e0e0',
          },
        },
        x: {
          title: { display: true, text: 'Skills' },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  })
}

function createApplicantSkillsChart() {
  if (!applicantSkillsChartCanvas.value) return

  // Destroy previous instance if exists
  if (applicantSkillsChartInstance) {
    applicantSkillsChartInstance.destroy()
  }

  const { applicantSkills, applicantCounts } = skillsData.value

  // Limit to 15 skills for better visualization
  const displaySkills = applicantSkills.slice(0, 15)
  const displayCounts = applicantCounts.slice(0, 15)

  applicantSkillsChartInstance = new Chart(applicantSkillsChartCanvas.value, {
    type: 'bar', // Changed to bar chart for better count visualization
    data: {
      labels: displaySkills,
      datasets: [
        {
          label: 'Applicant Skills Available (Count)',
          data: displayCounts,
          backgroundColor: 'rgba(255, 107, 53, 0.7)',
          borderColor: '#FF6B35',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: { display: true, text: 'Applicant Skills Available' },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`
            },
          },
        },
      },
      scales: {
        y: {
          title: { display: true, text: 'Available (Count)' },
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          grid: {
            drawOnChartArea: true,
            color: '#e0e0e0',
          },
        },
        x: {
          title: { display: true, text: 'Skills' },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  })
}

// Initialize charts function
const initializeCharts = async () => {
  await nextTick()
  setLargeChartSizes()
  setTimeout(() => {
    createJobSkillsChart()
    createApplicantSkillsChart()
  }, 100)
}

// Lifecycle hooks
onMounted(() => {
  initializeCharts()
  fetchSkillsData() // Fetch real data from API
})

onBeforeUnmount(() => {
  // Clean up chart instances
  if (jobSkillsChartInstance) {
    jobSkillsChartInstance.destroy()
    jobSkillsChartInstance = null
  }
  if (applicantSkillsChartInstance) {
    applicantSkillsChartInstance.destroy()
    applicantSkillsChartInstance = null
  }
})

// Expose refresh function for parent components
defineExpose({
  refreshSkillsData,
})
</script>

<style scoped>
/* (Keep all existing styles the same) */
.skills-section {
  background: #f8fafc;
}

.chart-card-enhanced {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s ease;
  height: 100%;
}

.chart-card-enhanced:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.chart-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.skills-chart-container {
  width: 100%;
  height: 480px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow-x: auto;
}

.skills-chart-container canvas {
  max-width: 100%;
  max-height: 100%;
  cursor: default;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
}

@media (max-width: 1024px) {
  .skills-chart-container {
    height: 420px;
  }
}

@media (max-width: 768px) {
  .skills-chart-container {
    height: 360px;
    padding: 10px;
  }
}

@media (max-width: 599px) {
  .skills-chart-container {
    height: 320px;
  }

  .skills-chart-container canvas {
    touch-action: none;
  }
}
</style>
