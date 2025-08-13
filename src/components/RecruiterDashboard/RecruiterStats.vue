<!-- AnalyticsRecords.vue -->
<template>
  <!-- Job Posting Analytics Header -->
  <div class="analytics-header q-pa-lg">
    <div class="row justify-between items-center q-pa-md">
      <div>
        <h4 class="text-h5 q-ma-none text-weight-bold">Job Posting Analytics</h4>
        <p class="text-subtitle2 text-grey-7 q-mt-sm">
          Track and monitor your job posting performance
        </p>
      </div>
      <q-select
        v-model="jobAnalyticsFilter"
        :options="jobFilterOptions"
        label="Filter by"
        dense
        outlined
        class="filter-select"
        emit-value
        map-options
      />
    </div>
  </div>

  <!-- Job Posting Stats Cards - All in one row -->
  <div class="stats-section q-px-lg">
    <!-- Optional refresh button -->
    <div class="row justify-end q-mb-md">
      <q-btn
        flat
        round
        icon="refresh"
        @click="refreshStats"
        :loading="isLoadingStats"
        color="primary"
        size="sm"
      >
        <q-tooltip>Refresh Stats</q-tooltip>
      </q-btn>
    </div>

    <div class="row q-gutter-md">
      <div class="col" v-for="(stat, index) in jobAnalyticsStats" :key="index">
        <q-card class="stat-card-enhanced">
          <q-card-section class="text-center">
            <div class="stat-icon-wrapper q-mb-sm">
              <q-icon :name="stat.icon" size="32px" :color="stat.color" />
              <!-- Optional: Add a small globe icon for global stats -->
              <q-icon
                v-if="stat.isGlobal"
                name="public"
                size="12px"
                color="grey-5"
                class="absolute-top-right q-ma-xs"
              >
                <q-tooltip>Platform-wide metric</q-tooltip>
              </q-icon>
            </div>

            <!-- Loading skeleton or actual value -->
            <div v-if="isLoadingStats" class="text-h3 stat-value-enhanced">
              <q-skeleton type="text" width="60px" height="40px" />
            </div>
            <div v-else class="text-h3 stat-value-enhanced" :class="`text-${stat.color}`">
              {{ stat.value }}
            </div>

            <div class="text-body2 stat-label-enhanced">{{ stat.label }}</div>

            <!-- Enhanced change display -->
            <div
              class="text-caption text-grey-6 q-mt-xs"
              v-if="stat.change !== undefined && !isLoadingStats"
            >
              <template v-if="stat.isGlobal">
                <!-- For global stats, show platform growth -->
                <q-icon name="trending_up" color="positive" size="16px" />
                {{ Math.abs(stat.change) }}% platform growth
              </template>
              <template v-else>
                <!-- For personal stats, show month-over-month change -->
                <q-icon
                  :name="
                    stat.change > 0
                      ? 'trending_up'
                      : stat.change < 0
                        ? 'trending_down'
                        : 'trending_flat'
                  "
                  :color="stat.change > 0 ? 'positive' : stat.change < 0 ? 'negative' : 'grey'"
                  size="16px"
                />
                <span v-if="stat.change !== 0">{{ Math.abs(stat.change) }}% from last month</span>
                <span v-else>No change from last month</span>
              </template>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>

  <!-- Analytics Charts and Table Layout -->
  <div class="content-section q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Application Status Pie Chart - Reduced Size -->
      <div class="col-12 col-md-4">
        <q-card class="chart-card-enhanced">
          <q-card-section>
            <div class="chart-header">
              <div class="text-h6">Application Status</div>
              <div class="text-caption text-grey-6">Current applications breakdown</div>
            </div>
            <div class="pie-chart-container">
              <canvas ref="pieChartCanvas"></canvas>
              <!-- Legend -->
              <div class="pie-legend q-mt-md">
                <div v-for="(label, index) in pieChartData.labels" :key="label" class="legend-item">
                  <div
                    class="legend-color"
                    :style="{ backgroundColor: pieChartData.colors[index] }"
                  ></div>
                  <span class="legend-text">{{ label }}: {{ pieChartData.counts[index] }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Top Performing Job Posts - Takes More Space -->
      <div class="col-12 col-md-8">
        <q-card class="table-card-enhanced">
          <q-card-section>
            <div class="table-header q-mb-md">
              <div class="row justify-between items-center">
                <div>
                  <div class="text-h6">Top Performing Job Posts</div>
                  <div class="text-caption text-grey-6">
                    Live job market data with highest engagement
                  </div>
                </div>
                <q-btn
                  flat
                  round
                  icon="refresh"
                  @click="refreshJobData"
                  :loading="isLoadingJobs"
                  color="primary"
                  size="sm"
                >
                  <q-tooltip>Refresh Job Data</q-tooltip>
                </q-btn>
              </div>
            </div>

            <q-table
              flat
              bordered
              :rows="filteredJobs"
              :columns="jobPostColumns"
              row-key="title"
              class="enhanced-table"
              :grid="$q.screen.xs"
              :rows-per-page-options="[5, 10, 15]"
              :pagination="{ rowsPerPage: 5 }"
            >
              <!-- Status Badge Template -->
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="getStatusColor(props.value)"
                    :label="props.value"
                    class="status-badge"
                  />
                </q-td>
              </template>

              <!-- Rate with Progress Bar -->
              <template v-slot:body-cell-rate="props">
                <q-td :props="props">
                  <div class="rate-cell">
                    <span class="rate-text">{{ props.value }}%</span>
                    <q-linear-progress
                      :value="props.value / 100"
                      size="4px"
                      :color="getRateColor(props.value)"
                      class="rate-progress q-mt-xs"
                    />
                  </div>
                </q-td>
              </template>

              <!-- Company Column -->
              <template v-slot:body-cell-company="props">
                <q-td :props="props">
                  <div class="company-cell">
                    <q-avatar size="24px" color="primary" text-color="white" class="q-mr-sm">
                      {{ props.value.charAt(0) }}
                    </q-avatar>
                    <span>{{ props.value }}</span>
                  </div>
                </q-td>
              </template>

              <!-- Mobile Grid Template -->
              <template v-slot:item="props" v-if="$q.screen.xs">
                <div class="col-12">
                  <q-card class="mobile-job-card q-ma-sm">
                    <q-card-section>
                      <div class="text-weight-bold text-primary">{{ props.row.title }}</div>
                      <div class="text-caption text-grey-7 q-mb-sm">{{ props.row.company }}</div>
                      <div class="row justify-between q-mt-sm">
                        <div class="col">
                          <div class="text-caption text-grey-7">Applicants</div>
                          <div class="text-h6">{{ props.row.applicants }}</div>
                        </div>
                        <div class="col">
                          <div class="text-caption text-grey-7">Success Rate</div>
                          <div class="text-h6">{{ props.row.rate }}%</div>
                        </div>
                        <div class="col">
                          <q-badge
                            :color="getStatusColor(props.row.status)"
                            :label="props.row.status"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()
const token = userStore.token || sessionStorage.getItem('token')
const $q = useQuasar()

// Chart refs
const pieChartCanvas = ref(null)

// Chart instances
let pieChartInstance = null

const jobAnalyticsFilter = ref('all')

const jobFilterOptions = [
  { label: 'All Jobs', value: 'all' },
  { label: 'Open Only', value: 'open' },
  { label: 'Closed Only', value: 'closed' },
  { label: 'Active (Open + Interviewing)', value: 'active' },
]

// Job posts with API integration
const topJobPosts = ref([])
const isLoadingJobs = ref(false)

// Table columns
const jobPostColumns = [
  {
    name: 'title',
    required: true,
    label: 'TITLE',
    align: 'left',
    field: 'title',
    sortable: true,
  },
  {
    name: 'company',
    label: 'COMPANY',
    align: 'left',
    field: 'company',
    sortable: true,
  },
  {
    name: 'applicants',
    label: 'APPLICANTS',
    align: 'center',
    field: 'applicants',
    sortable: true,
  },
  {
    name: 'rate',
    label: 'RATE',
    align: 'center',
    field: 'rate',
    sortable: true,
  },
  {
    name: 'status',
    label: 'STATUS',
    align: 'center',
    field: 'status',
  },
  {
    name: 'posted',
    label: 'POSTED',
    align: 'center',
    field: 'posted',
    sortable: true,
  },
]

// API Integration for Job Posts
const fetchMockJobData = async () => {
  isLoadingJobs.value = true
  try {
    // Get user data for company names
    const response = await fetch('https://jsonplaceholder.typicode.com/users')
    const users = await response.json()

    const jobTitles = [
      'Senior Frontend Developer',
      'Backend Engineer',
      'Full Stack Developer',
      'DevOps Engineer',
      'UI/UX Designer',
      'Product Manager',
      'Data Scientist',
      'Software Engineer',
      'Mobile Developer',
      'Cloud Architect',
      'Machine Learning Engineer',
      'QA Engineer',
    ]

    const statuses = ['Open', 'Closed', 'Interviewing']

    topJobPosts.value = jobTitles
      .slice(0, 8)
      .map((title, index) => ({
        title,
        company: users[index]?.company?.name || `Tech Corp ${index + 1}`,
        applicants: Math.floor(Math.random() * 200) + 80,
        rate: Math.floor(Math.random() * 50) + 25,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        posted: new Date(
          2025 - Math.floor(Math.random() * 2),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1,
        )
          .toISOString()
          .split('T')[0],
      }))
      .sort((a, b) => b.applicants - a.applicants)
  } catch (error) {
    console.error('Error fetching mock data:', error)
    // Fallback to static data
    topJobPosts.value = generateFallbackData()
  } finally {
    isLoadingJobs.value = false
  }
}

const generateFallbackData = () => {
  const fallbackJobs = [
    'Senior React Developer',
    'Node.js Engineer',
    'Python Developer',
    'DevOps Specialist',
    'UX Designer',
    'Product Manager',
  ]

  return fallbackJobs.map((title, index) => ({
    title,
    company: `Company ${index + 1}`,
    applicants: Math.floor(Math.random() * 150) + 70,
    rate: Math.floor(Math.random() * 40) + 30,
    status: ['Open', 'Interviewing'][Math.floor(Math.random() * 2)],
    posted: new Date(2025, Math.floor(Math.random() * 8), Math.floor(Math.random() * 28) + 1)
      .toISOString()
      .split('T')[0],
  }))
}

const refreshJobData = () => {
  fetchMockJobData()
}

const getStatusColor = (status) => {
  const colors = {
    Open: 'positive',
    Closed: 'grey',
    Interviewing: 'warning',
    Pending: 'info',
  }
  return colors[status] || 'grey'
}

const getRateColor = (rate) => {
  if (rate >= 60) return 'positive'
  if (rate >= 40) return 'warning'
  return 'negative'
}

const piestats = ref({
  pending: 0,
  accepted: 0,
  rejected: 0,
})

// Fetch pie chart data
const fetchPie = async () => {
  isLoadingStats.value = true
  try {
    const response = await fetch('http://localhost:3000/jobs/PieChart', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      piestats.value = {
        pending: data.pending,
        accepted: data.accepted,
        rejected: data.rejected,
      }
      console.log('Updated pie stats:', piestats.value)

      await nextTick()
      createPieChart()
    } else {
      console.error('Failed to fetch pie chart data:', response.status)
    }
  } catch (error) {
    console.error('Error fetching pie chart data:', error)
  } finally {
    isLoadingStats.value = false
  }
}

// Computed properties
const pieChartData = computed(() => {
  const pending = piestats.value.pending
  const accepted = piestats.value.accepted
  const rejected = piestats.value.rejected

  return {
    labels: ['Pending', 'Accepted', 'Rejected'],
    counts: [pending, accepted, rejected],
    colors: ['#FF9800', '#4CAF50', '#F44336'],
  }
})

const filteredJobs = computed(() => {
  let jobs = [...topJobPosts.value]

  switch (jobAnalyticsFilter.value) {
    case 'open':
      return jobs.filter((job) => job.status === 'Open')
    case 'closed':
      return jobs.filter((job) => job.status === 'Closed')
    case 'active':
      return jobs.filter((job) => ['Open', 'Interviewing'].includes(job.status))
    default:
      return jobs
  }
})

// API Stats
const apiStats = ref({
  total_jobs: 0,
  jobs_this_month: 0,
  total_recruiters: 0,
  active_jobs: 0,
  jobs_change: 0,
  jobs_this_month_change: 0,
  platform_growth: 0,
  active_jobs_change: 0,
})

const isLoadingStats = ref(false)

const fetchJobStats = async () => {
  isLoadingStats.value = true
  try {
    const response = await fetch('http://localhost:3000/jobs/getTotalJobsByRecruiter', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      apiStats.value = data.stats
      console.log('Updated stats:', data.stats)
    } else {
      console.error('Failed to fetch job stats:', response.status)
    }
  } catch (error) {
    console.error('Error fetching job stats:', error)
  } finally {
    isLoadingStats.value = false
  }
}

const jobAnalyticsStats = computed(() => {
  return [
    {
      value: apiStats.value.total_jobs || 0,
      label: 'Total Job Posts',
      icon: 'work',
      color: 'primary',
      change: apiStats.value.jobs_change || 0,
    },
    {
      value: apiStats.value.jobs_this_month || 0,
      label: 'Jobs This Month',
      icon: 'calendar_today',
      color: 'positive',
      change: apiStats.value.jobs_this_month_change || 0,
    },
    {
      value: apiStats.value.total_recruiters || 0,
      label: 'Platform Recruiters',
      icon: 'people',
      color: 'warning',
      change: apiStats.value.platform_growth || 0,
      isGlobal: true,
    },
    {
      value: apiStats.value.active_jobs || 0,
      label: 'Active Jobs',
      icon: 'play_circle',
      color: 'info',
      change: apiStats.value.active_jobs_change || 0,
    },
  ]
})

const refreshStats = () => {
  fetchJobStats()
  fetchPie()
}

// Enhanced pie chart with better styling
function createPieChart() {
  if (!pieChartCanvas.value) return

  const canvas = pieChartCanvas.value
  const ctx = canvas.getContext('2d')
  const data = pieChartData.value

  // Set canvas size - smaller for better layout
  canvas.width = 220
  canvas.height = 220

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 30

  const total = data.counts.reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    // Draw empty state
    ctx.fillStyle = '#f0f0f0'
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = '#666'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('No Data', centerX, centerY)
    return
  }

  let currentAngle = -Math.PI / 2

  // Draw pie slices with shadow effect
  data.counts.forEach((count, index) => {
    if (count > 0) {
      const sliceAngle = (count / total) * 2 * Math.PI

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = data.colors[index]
      ctx.fill()

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // White border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      currentAngle += sliceAngle
    }
  })

  // Draw center circle for donut effect
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 2
  ctx.stroke()

  // Center text
  ctx.fillStyle = '#333'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(total.toString(), centerX, centerY - 5)
  ctx.font = '12px Arial'
  ctx.fillText('Total', centerX, centerY + 12)
}

// Initialize charts
const initializeCharts = async () => {
  await nextTick()
  setTimeout(() => {
    createPieChart()
  }, 100)
}

pieChartInstance

// Watchers
watch(
  pieChartData,
  () => {
    createPieChart()
  },
  { deep: true },
)

// Lifecycle hooks
onMounted(() => {
  fetchJobStats()
  fetchPie()
  fetchMockJobData()
  initializeCharts()

  // Auto-refresh job data every 60 seconds
  setInterval(() => {
    if (!isLoadingJobs.value) {
      fetchMockJobData()
    }
  }, 60000)
})

onBeforeUnmount(() => {
  pieChartInstance = null
})
</script>

<style scoped>
/* Header Styling */
.analytics-header {
  background: linear-gradient(135deg, black 0%, grey 100%);
  color: white;
  margin: -16px -16px 0 -16px;
}

.analytics-header .filter-select {
  min-width: 200px;
}

.analytics-header .filter-select >>> .q-field__control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.analytics-header .filter-select >>> .q-field__native {
  color: white;
}

/* Enhanced Stats Cards */
.stats-section {
  background: #f8fafc;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.stat-card-enhanced {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: white;
  min-height: 160px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.stat-card-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-card-enhanced:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.stat-value-enhanced {
  font-weight: 700;
  font-size: 2.5rem;
  line-height: 1;
  margin: 0.5rem 0;
}

.stat-label-enhanced {
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Content Section */
.content-section {
  background: white;
}

/* Pie Chart Styling */
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
  text-align: center;
}

.pie-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.pie-chart-container canvas {
  max-width: 100%;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-text {
  font-size: 12px;
  color: #666;
}

/* Enhanced Table */
.table-card-enhanced {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
}

.table-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
}

.enhanced-table {
  border: none;
}

.enhanced-table >>> .q-table__top {
  background: #f8fafc;
}

.enhanced-table >>> .q-table thead th {
  background: #f1f5f9;
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 12px 8px;
  border-bottom: 2px solid #e2e8f0;
}

.enhanced-table >>> .q-table tbody tr {
  transition: background-color 0.2s;
}

.enhanced-table >>> .q-table tbody tr:hover {
  background: #f8fafc;
}

.enhanced-table >>> .q-table tbody td {
  padding: 10px 8px;
  border-bottom: 1px solid #f1f5f9;
}

.status-badge {
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.rate-cell {
  min-width: 80px;
}

.rate-text {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.rate-progress {
  width: 50px;
}

.company-cell {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.mobile-job-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stat-value-enhanced {
    font-size: 2rem;
  }

  .pie-chart-container canvas {
    width: 180px !important;
    height: 180px !important;
  }
}

@media (max-width: 768px) {
  .analytics-header {
    text-align: center;
  }

  .analytics-header .row {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-card-enhanced {
    min-height: 140px;
  }

  .stat-value-enhanced {
    font-size: 1.8rem;
  }

  .pie-chart-container {
    padding: 5px;
  }
}

@media (max-width: 599px) {
  .content-section .row {
    flex-direction: column;
  }

  .stat-card-enhanced {
    min-height: 120px;
  }

  .stat-value-enhanced {
    font-size: 1.5rem;
  }

  .stat-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .pie-chart-container canvas {
    width: 150px !important;
    height: 150px !important;
  }
}
</style>
