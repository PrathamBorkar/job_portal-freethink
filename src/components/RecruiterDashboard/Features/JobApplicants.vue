<template>
  <div class="applicants-management">
    <!-- Header Section -->
    <div class="header-section">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <q-btn
            flat
            icon="arrow_back"
            label="Back to Jobs"
            color="primary"
            @click="goBack"
            class="modern-btn q-mb-sm"
          />
          <div class="text-h5 text-weight-bold">
            {{ jobDetails?.title || 'Job Applications' }}
          </div>
          <div class="text-subtitle2 text-grey-7">
            {{ jobDetails?.company }} • {{ jobDetails?.location }} •
            {{ jobDetails?.jobtype }}
            <span v-if="jobId" class="q-ml-sm">• Job ID: {{ jobId }}</span>
          </div>
        </div>
        <div class="col-auto">
          <div class="row q-gutter-md items-center">
            <q-toggle
              v-model="sendEmails"
              label="Email notifications"
              color="primary"
              class="modern-toggle"
            />
            <q-btn-toggle
              v-model="viewMode"
              toggle-color="primary"
              :options="[
                { label: 'Cards', value: 'cards' },
                { label: 'Table', value: 'table' },
              ]"
              class="modern-toggle"
            />
            <q-btn
              icon="download"
              label="Export"
              color="secondary"
              outline
              @click="exportApplicants"
              class="modern-btn"
            />
          </div>
        </div>
      </div>
    </div>

    <q-separator />

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-number text-primary">{{ totalApplicants }}</div>
          <div class="stat-label">Total Applicants</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number text-orange">{{ getStatusCount('pending') }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number stat-accepted">{{ getStatusCount('accepted') }}</div>
          <div class="stat-label">Accepted</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number stat-rejected">{{ getStatusCount('rejected') }}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </div>
    </div>

    <q-separator />

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Left Sidebar - Applicants List -->
      <div class="applicants-sidebar">
        <!-- Search and Filter -->
        <div class="filter-section">
          <q-input
            v-model="searchQuery"
            placeholder="Search applicants..."
            dense
            outlined
            clearable
            class="modern-input q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            label="Filter by status"
            dense
            outlined
            clearable
            emit-value
            map-options
            class="modern-input"
          />
        </div>

        <!-- Debug Info -->
        <div class="debug-info" v-if="$q.dev">
          <div>Total applicants: {{ applicants.length }}</div>
          <div>Filtered applicants: {{ filteredApplicants.length }}</div>
          <div>Loading: {{ loading }}</div>
        </div>

        <!-- Applicants List -->
        <div class="applicants-list">
          <div v-if="loading" class="loading-state">
            <q-spinner size="40px" color="primary" />
            <div class="q-mt-sm">Loading applicants...</div>
          </div>

          <div v-else-if="applicants.length === 0" class="empty-state">
            <q-icon name="inbox" size="48px" color="grey-4" />
            <div class="text-body1 text-grey-6 q-mt-sm">No applicants yet</div>
          </div>

          <div v-else class="applicant-cards">
            <div
              v-for="(applicant, idx) in filteredApplicants"
              :key="applicant.uid || applicant.resume_url || idx"
              @click="selectApplicant(applicant)"
              class="applicant-card"
              :class="{ selected: selectedApplicant?.uid === applicant.uid }"
            >
              <div class="applicant-header">
                <div class="applicant-avatar">
                  <q-avatar size="48px" icon="person" color="blue-4" text-color="white" />
                </div>
                <div class="applicant-info">
                  <div class="applicant-name">
                    {{ applicant.name || 'Applicant' }}
                  </div>
                  <div class="applicant-meta">Applied: {{ formatDate(applicant.applied) }}</div>
                </div>
                <q-chip
                  :color="statusColors[applicant.status]"
                  text-color="white"
                  size="sm"
                  class="status-chip"
                >
                  {{ applicant.status }}
                </q-chip>
              </div>
              <div class="applicant-details">
                <div class="detail-row">
                  <q-icon name="location_on" size="16px" />
                  <span>{{ applicant.preferredLocation || 'Not specified' }}</span>
                </div>
                <div class="detail-row">
                  <q-icon name="event_available" size="16px" />
                  <span>{{ applicant.availability || 'Not specified' }}</span>
                </div>
                <div v-if="applicant.resume_url" class="detail-row">
                  <a :href="applicant.resume_url" target="_blank" class="resume-link" @click.stop>
                    View Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <q-separator vertical />

      <!-- Right Panel - Applicant Details -->
      <div class="applicant-details">
        <div v-if="!selectedApplicant" class="no-selection">
          <q-icon name="person_search" size="120px" color="grey-4" class="q-mb-lg" />
          <div class="text-h6 text-grey-7">Select an applicant to view details</div>
          <div class="text-body2 text-grey-6">
            Choose from the list on the left to see their profile and application details
          </div>
        </div>

        <div v-else class="applicant-profile">
          <!-- Profile Header -->
          <div class="profile-header">
            <div class="profile-info">
              <q-avatar size="80px" class="profile-avatar">
                <img
                  :src="selectedApplicant.avatar || 'https://cdn.quasar.dev/img/avatar.png'"
                  :alt="selectedApplicant.name || 'Applicant'"
                />
              </q-avatar>
              <div class="profile-text">
                <div class="profile-name">
                  {{ selectedApplicant.name || 'Anonymous Applicant' }}
                </div>
                <div class="profile-email">
                  {{ selectedApplicant.email || 'No email provided' }}
                </div>
                <div class="profile-phone">
                  {{ selectedApplicant.phone || 'No phone number provided' }}
                </div>
                <div class="q-mt-sm">
                  <q-chip
                    :color="statusColors[selectedApplicant.status]"
                    text-color="white"
                    icon="circle"
                    class="status-chip-large"
                  >
                    {{ selectedApplicant.status.toUpperCase() }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="profile-actions">
              <q-btn
                color="positive"
                icon="check_circle"
                label="Accept"
                @click="updateStatus('accepted')"
                :disable="selectedApplicant.status === 'accepted'"
                :loading="updatingStatus"
                class="action-btn"
              />
              <q-btn
                color="orange"
                icon="schedule"
                label="Pending"
                @click="updateStatus('pending')"
                :disable="selectedApplicant.status === 'pending'"
                :loading="updatingStatus"
                outline
                class="action-btn"
              />
              <q-btn
                color="negative"
                icon="cancel"
                label="Reject"
                @click="updateStatus('rejected')"
                :disable="selectedApplicant.status === 'rejected'"
                :loading="updatingStatus"
                outline
                class="action-btn"
              />
            </div>
          </div>

          <q-separator class="profile-separator" />

          <!-- Profile Details Tabs -->
          <q-tabs
            v-model="activeTab"
            dense
            class="modern-tabs"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="overview" label="Overview" icon="person" />
            <q-tab name="resume" label="Resume & Documents" icon="description" />
            <q-tab name="education" label="Education" icon="school" />
            <q-tab name="experience" label="Experience" icon="work" />
            <q-tab name="contact" label="Contact Info" icon="contact_mail" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated class="tab-panels">
            <!-- Overview Tab -->
            <q-tab-panel name="overview" class="tab-panel">
              <div class="row q-gutter-lg">
                <div class="col-6">
                  <q-card class="info-card">
                    <q-card-section class="card-header">Application Details</q-card-section>
                    <q-card-section class="info-content">
                      <div class="info-row">
                        <span class="info-label">Applied On:</span>
                        <span class="info-value">{{ formatDate(selectedApplicant.applied) }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value">{{ selectedApplicant.status }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Preferred Location:</span>
                        <span class="info-value">{{
                          selectedApplicant.preferredLocation || 'Not specified'
                        }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Availability:</span>
                        <span class="info-value">{{
                          selectedApplicant.availability || 'Not specified'
                        }}</span>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-6">
                  <q-card class="info-card">
                    <q-card-section class="card-header">Links & Documents</q-card-section>
                    <q-card-section class="info-content">
                      <div class="info-row" v-if="selectedApplicant.linkedIn">
                        <span class="info-label">LinkedIn:</span>
                        <span class="info-value">
                          <a
                            :href="selectedApplicant.linkedIn"
                            target="_blank"
                            class="link-primary"
                          >
                            View Profile
                          </a>
                        </span>
                      </div>
                      <div class="info-row" v-if="selectedApplicant.portfolioWebsite">
                        <span class="info-label">Portfolio:</span>
                        <span class="info-value">
                          <a
                            :href="selectedApplicant.portfolioWebsite"
                            target="_blank"
                            class="link-primary"
                          >
                            View Portfolio
                          </a>
                        </span>
                      </div>
                      <div class="info-row" v-if="selectedApplicant.resume_url">
                        <span class="info-label">Resume:</span>
                        <span class="info-value">
                          <a
                            :href="selectedApplicant.resume_url"
                            target="_blank"
                            class="link-primary"
                          >
                            View Resume
                          </a>
                        </span>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Resume Tab -->
            <q-tab-panel name="resume" class="tab-panel">
              <q-card class="info-card">
                <q-card-section class="card-header">Documents & Resume</q-card-section>
                <q-card-section class="info-content">
                  <div v-if="selectedApplicant.resume_url" class="q-mb-md">
                    <q-btn
                      color="primary"
                      icon="visibility"
                      label="View Resume"
                      @click="viewResume(selectedApplicant.resume_url)"
                      class="q-mr-sm modern-btn"
                    />
                    <q-btn
                      color="secondary"
                      icon="download"
                      label="Download Resume"
                      @click="downloadResume(selectedApplicant.resume_url)"
                      outline
                      class="modern-btn"
                    />
                  </div>
                  <div v-else class="text-grey-6">No resume uploaded</div>

                  <!-- Cover Letter -->
                  <div
                    class="q-mt-lg"
                    v-if="selectedApplicant.coverLetter || selectedApplicant.cover_letter"
                  >
                    <div class="text-weight-medium q-mb-sm">Cover Letter</div>
                    <div class="cover-letter">
                      {{ selectedApplicant.coverLetter || selectedApplicant.cover_letter }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-tab-panel>

            <!-- Education Tab -->
            <q-tab-panel name="education" class="tab-panel">
              <q-card class="info-card">
                <q-card-section class="card-header">Education History</q-card-section>
                <q-card-section class="info-content">
                  <div v-if="selectedApplicant.education && selectedApplicant.education.length > 0">
                    <div
                      v-for="(edu, index) in selectedApplicant.education"
                      :key="index"
                      class="education-item"
                    >
                      <div class="education-header">
                        <div class="education-degree">
                          {{ edu.degree || 'Degree' }}
                        </div>
                        <div class="education-institution">
                          {{ edu.institution || 'Institution' }}
                        </div>
                      </div>
                      <div class="education-details">
                        <span v-if="edu.field_of_study">{{ edu.field_of_study }}</span>
                        <span v-if="edu.start_year || edu.end_year" class="education-years">
                          {{ edu.start_year || 'N/A' }} -
                          {{ edu.end_year || 'Present' }}
                        </span>
                      </div>
                      <div v-if="edu.grade || edu.percentage" class="education-grade">
                        <strong>Grade:</strong>
                        {{ edu.grade || edu.percentage || 'Not specified' }}
                      </div>
                      <div v-if="edu.description" class="education-description">
                        {{ edu.description }}
                      </div>
                    </div>
                  </div>

                  <div v-else-if="!selectedApplicant.detailsLoaded" class="text-center q-pa-lg">
                    <q-spinner size="24px" color="primary" />
                    <div class="q-mt-sm text-grey-6">Loading education details...</div>
                  </div>

                  <div v-else class="text-center q-pa-lg">
                    <q-icon name="school" size="48px" color="grey-4" />
                    <div class="text-body1 text-grey-6 q-mt-sm">No education records found</div>
                  </div>
                </q-card-section>
              </q-card>
            </q-tab-panel>

            <!-- Experience Tab -->
            <q-tab-panel name="experience" class="tab-panel">
              <q-card class="info-card">
                <q-card-section class="card-header">Work Experience</q-card-section>
                <q-card-section class="info-content">
                  <div
                    v-if="selectedApplicant.experience && selectedApplicant.experience.length > 0"
                  >
                    <div
                      v-for="(exp, index) in selectedApplicant.experience"
                      :key="index"
                      class="experience-item"
                    >
                      <div class="experience-header">
                        <div class="experience-position">
                          {{ exp.position || exp.job_title || 'Position' }}
                        </div>
                        <div class="experience-company">
                          {{ exp.company || 'Company' }}
                        </div>
                      </div>
                      <div class="experience-details">
                        <span v-if="exp.location">📍 {{ exp.location }}</span>
                        <span v-if="exp.start_date || exp.end_date" class="experience-duration">
                          {{ formatDate(exp.start_date) || 'N/A' }} -
                          {{ exp.end_date ? formatDate(exp.end_date) : 'Present' }}
                        </span>
                      </div>
                      <div v-if="exp.employment_type" class="q-mt-xs">
                        <q-chip size="sm" color="blue" text-color="white">
                          {{ exp.employment_type }}
                        </q-chip>
                      </div>
                      <div
                        v-if="exp.description || exp.responsibilities"
                        class="experience-description"
                      >
                        {{ exp.description || exp.responsibilities }}
                      </div>
                      <div v-if="exp.skills" class="experience-skills">
                        <div class="skills-label">Skills used:</div>
                        <div class="skills-list">
                          <q-chip
                            v-for="skill in (exp.skills || '').split(',').filter((s) => s.trim())"
                            :key="skill.trim()"
                            size="sm"
                            color="blue-1"
                            text-color="blue-10"
                            class="skill-chip"
                          >
                            {{ skill.trim() }}
                          </q-chip>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="!selectedApplicant.detailsLoaded" class="text-center q-pa-lg">
                    <q-spinner size="24px" color="primary" />
                    <div class="q-mt-sm text-grey-6">Loading experience details...</div>
                  </div>

                  <div v-else class="text-center q-pa-lg">
                    <q-icon name="work" size="48px" color="grey-4" />
                    <div class="text-body1 text-grey-6 q-mt-sm">No work experience found</div>
                  </div>
                </q-card-section>
              </q-card>
            </q-tab-panel>
            <q-tab-panel name="contact" class="tab-panel">
              <q-card class="info-card">
                <q-card-section class="card-header">Contact Information</q-card-section>
                <q-card-section class="info-content">
                  <div class="info-row">
                    <span class="info-label">LinkedIn:</span>
                    <span class="info-value">
                      <a
                        v-if="selectedApplicant.linkedIn"
                        :href="selectedApplicant.linkedIn"
                        target="_blank"
                        class="link-primary"
                      >
                        {{ selectedApplicant.linkedIn }}
                      </a>
                      <span v-else class="text-grey-6">Not provided</span>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Portfolio:</span>
                    <span class="info-value">
                      <a
                        v-if="selectedApplicant.portfolioWebsite"
                        :href="selectedApplicant.portfolioWebsite"
                        target="_blank"
                        class="link-primary"
                      >
                        {{ selectedApplicant.portfolioWebsite }}
                      </a>
                      <span v-else class="text-grey-6">Not provided</span>
                    </span>
                  </div>

                  <div class="q-mt-lg">
                    <q-btn
                      v-if="selectedApplicant.linkedIn"
                      color="primary"
                      icon="link"
                      label="Visit LinkedIn"
                      @click="window.open(selectedApplicant.linkedIn, '_blank')"
                      class="q-mr-sm modern-btn"
                    />
                    <q-btn
                      v-if="selectedApplicant.portfolioWebsite"
                      color="secondary"
                      icon="web"
                      label="Visit Portfolio"
                      @click="window.open(selectedApplicant.portfolioWebsite, '_blank')"
                      outline
                      class="modern-btn"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAppStore } from 'src/stores/app-store'

const $q = useQuasar()
const appStore = useAppStore()

// Props (for backward compatibility if passed as props)
const props = defineProps({
  jobDetails: {
    type: Object,
    default: () => ({}),
  },
  goBack: {
    type: Function,
  },
})

// Get jobId from route params or props
const jobId = computed(() => props.jobDetails?.jobid)

// UI State
const sendEmails = ref(false)
const viewMode = ref('cards')
const searchQuery = ref('')
const statusFilter = ref(null)
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
]
const statusColors = {
  pending: 'orange',
  accepted: 'positive',
  rejected: 'negative',
}
const activeTab = ref('overview')
const selectedApplicant = ref(null)
const updatingStatus = ref(false)
const jobDetails = ref(props.jobDetails || {})

// Local applicants state
const applicants = ref([])
const loading = ref(false)

// Computed filtered list
const filteredApplicants = computed(() => {
  let filtered = applicants.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (applicant) =>
        (applicant.preferredLocation || '').toLowerCase().includes(query) ||
        (applicant.status || '').toLowerCase().includes(query) ||
        (applicant.availability || '').toLowerCase().includes(query) ||
        (applicant.name || '').toLowerCase().includes(query),
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter((applicant) => applicant.status === statusFilter.value)
  }

  return filtered
})

// Stats
const totalApplicants = computed(() => applicants.value.length)

function getStatusCount(status) {
  return applicants.value.filter((a) => a.status === status).length
}

// Selection
async function selectApplicant(applicant) {
  selectedApplicant.value = applicant
  activeTab.value = 'overview'

  // Load additional details if uid is available
  if (applicant.uid) {
    await loadApplicantDetails(applicant.uid)
  }
}

// Load detailed applicant information
async function loadApplicantDetails(uid) {
  try {
    // Load education and experience in parallel
    const [educationResponse, experienceResponse] = await Promise.all([
      appStore.getEducation(uid).catch((err) => {
        console.warn('Education data not available:', err)
        return null
      }),
      appStore.getExperience(uid).catch((err) => {
        console.warn('Experience data not available:', err)
        return null
      }),
    ])

    // Add the detailed data to selected applicant
    if (selectedApplicant.value) {
      selectedApplicant.value = {
        ...selectedApplicant.value,
        education: educationResponse?.data || [],
        experience: experienceResponse?.data || [],
        detailsLoaded: true,
      }
    }
  } catch (error) {
    console.error('Error loading applicant details:', error)
  }
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

// Status update
async function updateStatus(status) {
  if (!selectedApplicant.value || !selectedApplicant.value.uid) {
    $q.notify({
      type: 'warning',
      message: 'Cannot update status: Applicant UID not available',
    })
    return
  }

  updatingStatus.value = true
  try {
    // Call the backend API with uid and status
    await appStore.updateStatus({
      uid: selectedApplicant.value.uid,
      status: status,
    })

    // Update local state
    selectedApplicant.value.status = status

    // Update in the applicants array
    const index = applicants.value.findIndex((a) => a.uid === selectedApplicant.value.uid)
    if (index !== -1) {
      applicants.value[index].status = status
    }

    $q.notify({
      type: 'positive',
      message: `Status updated to ${status}. Email notification sent.`,
    })
  } catch (err) {
    console.error('Status update error:', err)
    $q.notify({
      type: 'negative',
      message: `Error updating status: ${err.message}`,
    })
  } finally {
    updatingStatus.value = false
  }
}

// Resume actions
function viewResume(url) {
  if (url) {
    window.open(url, '_blank')
  } else {
    $q.notify({
      type: 'warning',
      message: 'Resume URL not available',
    })
  }
}

function downloadResume(url) {
  if (!url) {
    $q.notify({
      type: 'warning',
      message: 'Resume URL not available',
    })
    return
  }

  const link = document.createElement('a')
  link.href = url
  link.download = 'resume.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export applicants
function exportApplicants() {
  if (applicants.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No applicants to export',
    })
    return
  }

  const csvContent = [
    ['Status', 'Preferred Location', 'Availability', 'Applied Date', 'LinkedIn', 'Portfolio'],
    ...applicants.value.map((a) => [
      a.status,
      a.preferredLocation || '',
      a.availability || '',
      formatDate(a.applied),
      a.linkedIn || '',
      a.portfolioWebsite || '',
    ]),
  ]
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `applicants_${jobId.value || 'unknown'}.csv`
  link.click()
}

// Load applications
async function loadApplications() {
  if (!jobId.value) {
    $q.notify({
      type: 'warning',
      message: 'No job ID provided',
    })
    return
  }

  loading.value = true
  try {
    const response = await appStore.getApplication(jobId.value)

    if (response && response.data) {
      applicants.value = Array.isArray(response.data) ? response.data : [response.data]
      applicants.value = applicants.value.map((applicant, index) => ({
        ...applicant,
        uid: applicant.uid || `temp_${index}`,
        name: applicant.name || `Applicant ${index + 1}`,
      }))
    } else if (response && Array.isArray(response)) {
      applicants.value = response
    } else {
      applicants.value = appStore.applications || []
    }
  } catch (err) {
    console.error('Error loading applications:', err)
    $q.notify({
      type: 'negative',
      message: `Error loading applications: ${err.message}`,
    })
    applicants.value = []
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.applicants-management {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}
.header-section {
  background: #ffffff;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.modern-toggle .q-btn {
  border-radius: 6px;
}
.modern-btn {
  border-radius: 6px;
  font-weight: 500;
  text-transform: none;
}
.stats-section {
  background: #f8f9fa;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}
.stats-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  max-width: 800px;
  margin: 0 auto;
}
.stat-item {
  text-align: center;
  min-width: 120px;
}
.stat-number {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
}
.stat-number.text-primary {
  color: #3b82f6;
}
.stat-number.text-orange {
  color: #f59e0b;
}
.stat-number.stat-accepted {
  color: #475569;
}
.stat-number.stat-rejected {
  color: #6b7280;
}
.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}
.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
}
.applicants-sidebar {
  background: white;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
  width: 420px;
  min-width: 320px;
}
.filter-section {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafbfc;
}
.modern-input .q-field__control {
  border-radius: 8px;
}
.debug-info {
  padding: 8px 20px;
  background: #f8f9fa;
  font-size: 11px;
  color: #6c757d;
  border-bottom: 1px solid #f3f4f6;
}
.applicants-list {
  padding: 12px;
}
.loading-state,
.empty-state {
  text-align: center;
  padding: 48px 20px;
}
.applicant-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.applicant-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.16s ease;
}
.applicant-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
.applicant-card.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
.applicant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.applicant-avatar {
  flex-shrink: 0;
}
.applicant-info {
  flex: 1;
  min-width: 0;
}
.applicant-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}
.applicant-meta {
  font-size: 12px;
  color: #6b7280;
}
.status-chip {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
}
.applicant-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}
.resume-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}
.resume-link:hover {
  text-decoration: underline;
}
.applicant-details {
  background: #fafafa;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
  flex: 1;
  padding: 0;
}
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 48px;
}
.applicant-profile {
  height: auto;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.profile-header {
  background: white;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid #e8e8e8;
}
.profile-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}
.profile-avatar {
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}
.profile-avatar img {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: cover;
}
.profile-text {
  flex: 1;
}
.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}
.profile-email,
.profile-phone {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 2px;
}
.status-chip-large {
  font-weight: 600;
}
.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
}
.action-btn {
  border-radius: 6px;
  font-weight: 500;
}
.profile-separator {
  background: #e8e8e8;
}
.modern-tabs {
  background: white;
  padding: 0 24px;
  border-bottom: 1px solid #e8e8e8;
}
.modern-tabs .q-tab {
  color: #6b7280;
  font-weight: 500;
  text-transform: none;
}
.modern-tabs .q-tab--active {
  color: #3b82f6;
}
.tab-panels {
  flex: 1;
  background: #fafafa;
  overflow-y: auto;
}
.tab-panel {
  padding: 24px;
  min-height: 400px;
}
.info-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.card-header {
  background: #f8f9fa;
  padding: 16px 20px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}
.info-content {
  padding: 20px;
}
.info-row {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
}
.info-label {
  width: 150px;
  color: #6b7280;
  font-weight: 600;
  font-size: 13px;
}
.info-value {
  flex: 1;
  color: #111827;
  font-size: 14px;
}
.education-item {
  padding: 12px 0;
  border-bottom: 1px dashed #eef2f7;
}
.education-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.education-degree {
  font-weight: 600;
  color: #111827;
}
.education-institution {
  color: #6b7280;
  font-size: 13px;
}
.education-details {
  color: #4b5563;
  font-size: 13px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.education-years {
  color: #6b7280;
  font-size: 13px;
}
.education-grade {
  font-size: 13px;
  color: #374151;
  margin-top: 6px;
}
.education-description {
  color: #6b7280;
  font-size: 13px;
  margin-top: 8px;
}
.experience-item {
  padding: 12px 0;
  border-bottom: 1px dashed #eef2f7;
}
.experience-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.experience-position {
  font-weight: 600;
  color: #111827;
}
.experience-company {
  color: #6b7280;
  font-size: 13px;
}
.experience-details {
  color: #4b5563;
  font-size: 13px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.experience-duration {
  color: #6b7280;
  font-size: 13px;
}
.experience-description {
  color: #4b5563;
  margin-top: 8px;
  font-size: 13px;
}
.experience-skills {
  margin-top: 8px;
}
.skills-label {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
  margin-bottom: 6px;
}
.skills-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.skill-chip {
  background: #eff6ff;
  color: #075985;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
}
.cover-letter {
  background: #ffffff;
  border: 1px solid #eef2f7;
  padding: 12px;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  white-space: pre-wrap;
}
.link-primary {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
}
.link-primary:hover {
  text-decoration: underline;
}
.q-separator--vertical {
  margin: 0 12px;
  height: auto;
}
.applicants-sidebar::-webkit-scrollbar,
.applicant-details::-webkit-scrollbar,
.tab-panels::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.applicants-sidebar::-webkit-scrollbar-thumb,
.applicant-details::-webkit-scrollbar-thumb,
.tab-panels::-webkit-scrollbar-thumb {
  background: rgba(16, 24, 40, 0.06);
  border-radius: 8px;
}
@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }
  .applicants-sidebar {
    width: 100%;
    min-width: auto;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
  }
  .q-separator--vertical {
    display: none;
  }
  .profile-actions {
    flex-direction: row;
    justify-content: flex-start;
    min-width: 0;
    gap: 8px;
  }
  .profile-avatar img {
    width: 64px;
    height: 64px;
  }
  .profile-name {
    font-size: 18px;
  }
  .tab-panel {
    padding: 16px;
    min-height: auto;
  }
}
</style>
