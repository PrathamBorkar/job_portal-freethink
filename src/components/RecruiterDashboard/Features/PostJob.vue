<template>
  <div class="form-wrapper">
    <q-card class="post-job-card">
      <div class="form-header">
        {{ isPreviewing ? 'Preview Job Post' : 'Post a Job' }}
      </div>

      <q-form v-if="!isPreviewing" ref="formRef" @submit.prevent="handlePreview">
        <div class="section-title">Basic Details</div>
        <div class="form-entry">
          <q-input
            v-model="form.title"
            label="Job Title"
            filled
            :rules="[isRequired, maxLength(100)]"
          />
          <q-input v-model="form.companyName" label="Company Name" filled readonly />
          <q-select
            v-model="form.job_type"
            :options="jobTypes"
            label="Job Type"
            filled
            :rules="[isRequired]"
          />
        </div>

        <div class="section-title">Job Logistics</div>
        <div class="form-entry">
          <q-select
            v-model="form.mode_of_work"
            :options="modeOptions"
            label="Mode of Work"
            filled
            :rules="[isRequired]"
          />

          <!-- Experience Range -->
          <div class="experience-range">
            <q-input
              v-model.number="form.experience_min"
              label="Min Experience (Years)"
              type="number"
              filled
              :rules="[isRequired, isPositiveNumber]"
              min="0"
              max="50"
              class="experience-input"
            />
            <q-input
              v-model.number="form.experience_max"
              label="Max Experience (Years)"
              type="number"
              filled
              :rules="[isPositiveNumber, validateExperienceRange]"
              min="0"
              max="50"
              class="experience-input"
            />
          </div>

          <!-- Salary Range -->
          <div class="salary-range">
            <q-input
              v-model.number="form.salary_min"
              label="Min Salary (₹)"
              type="number"
              filled
              :rules="[isRequired, isSalaryValid]"
              min="1000"
              placeholder="e.g. 400000"
              class="salary-input"
            />
            <q-input
              v-model.number="form.salary_max"
              label="Max Salary (₹)"
              type="number"
              filled
              :rules="[isSalaryValid, validateSalaryRange]"
              min="1000"
              placeholder="e.g. 600000"
              class="salary-input"
            />
          </div>

          <!-- Equity Range (Optional) -->
          <div class="equity-range">
            <q-input
              v-model.number="form.equity_min"
              label="Min Equity % (Optional)"
              type="number"
              filled
              min="0"
              max="100"
              step="0.1"
              class="equity-input"
            />
            <q-input
              v-model.number="form.equity_max"
              label="Max Equity % (Optional)"
              type="number"
              filled
              min="0"
              max="100"
              step="0.1"
              :rules="[validateEquityRange]"
              class="equity-input"
            />
          </div>

          <!-- Number of Openings -->
          <q-input
            v-model.number="form.opening"
            label="Number of Openings"
            type="number"
            filled
            :rules="[isRequired, isPositiveOpenings]"
            min="1"
            max="100"
          />
        </div>

        <div class="section-title">Additional Details</div>
        <div class="form-entry">
          <!-- Qualification ID (Simple integer input for now) -->
          <q-select
            v-model="form.qualification"
            :options="qualificationOptions"
            label="Qualification"
            filled
            :rules="[isRequired]"
          />

          <!-- Market ID (Simple integer input for now) -->

          <q-select
            v-model="form.job_markets"
            :options="MarketOptions"
            label="Select Markets"
            filled
            use-chips
            multiple
            :rules="[isRequired]"
            emit-value
            map-options
            :loading="skillsLoading"
            :disable="skillsLoading"
          />

          <q-select
            v-model="form.job_roles"
            :options="RoleOptions"
            label="Select job roles"
            filled
            use-chips
            multiple
            :rules="[isRequired]"
            emit-value
            map-options
            :loading="skillsLoading"
            :disable="skillsLoading"
          />
        </div>

        <div class="section-title">Location & Skills</div>
        <div class="form-entry">
          <q-select
            v-model="form.lid"
            :options="locationOptions"
            label="Branch Location"
            filled
            :rules="[isRequired]"
            emit-value
            map-options
            :loading="locationsLoading"
            :disable="locationsLoading"
          />
          <q-select
            v-model="form.skillids"
            :options="skillOptions"
            label="Required Skills"
            filled
            use-chips
            multiple
            :rules="[isRequired]"
            emit-value
            map-options
            :loading="skillsLoading"
            :disable="skillsLoading"
          />
        </div>

        <div class="section-title">Description</div>
        <div class="form-entry">
          <q-input
            v-model="form.smallDescription"
            label="Short Description"
            type="textarea"
            filled
            :rules="[minLength(10), maxLength(100), isRequired]"
            placeholder="e.g. A brief summary of the job role"
          />
        </div>

        <div class="form-entry q-mt-md">
          <q-input
            v-model="form.bigDescription"
            label="Detailed Job Description"
            type="textarea"
            filled
            :rules="[minLength(20), isRequired]"
            placeholder="e.g. Full responsibilities, requirements, etc."
            rows="6"
          />
        </div>

        <q-card-actions align="right">
          <q-btn type="submit" label="Preview Job" color="primary" />
        </q-card-actions>
      </q-form>

      <!-- Preview Mode -->
      <div v-else class="form-wrapper">
        <q-separator />
        <q-card-section>
          <PreviewJob :job="previewJob" />
        </q-card-section>
        <q-card-actions align="between" class="q-pa-md">
          <q-btn flat label="Back to Edit" color="grey-6" @click="isPreviewing = false" />
          <q-btn label="Submit Job" color="primary" @click="submitJob" :loading="isSubmitting" />
        </q-card-actions>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useJobsStore } from 'src/stores/jobStore'
import { useUserStore } from 'src/stores/user-store'
import PreviewJob from './PreviewJob.vue'

const $q = useQuasar()
const jobsStore = useJobsStore()

// Base URL for API calls
const baseUrl = 'http://localhost:3000'

const formRef = ref(null)
const isPreviewing = ref(false)
const isSubmitting = ref(false)

// Loading states for dropdowns
const skillsLoading = ref(false)
const locationsLoading = ref(false)

// Data arrays
const skills = ref([])
const locations = ref([])

// Convert skills and locations to select options
const skillOptions = computed(() =>
  skills.value.map((skill) => ({
    label: skill.name,
    value: skill.id,
  })),
)

const locationOptions = computed(() =>
  locations.value.map((location) => ({
    label: location.name,
    value: location.id,
  })),
)

const form = ref({
  title: '',
  companyName: '',
  job_type: '',
  mode_of_work: '',
  experience_min: 0,
  experience_max: 0,
  salary_min: 0,
  salary_max: 0,
  equity_min: 0,
  equity_max: 0,
  opening: 1,
  qualification: null,
  job_markets: [],
  job_roles: [],
  lid: null,
  cid: null,
  skillids: [],
  bigDescription: '',
  smallDescription: '',
})

const previewJob = computed(() => {
  const selectedLocation = locations.value.find((location) => location.id === form.value.lid)

  let selectedSkills = form.value.skillids.map((skillId) => {
    const skill = skills.value.find((skill) => skill.id === skillId)
    return skill ? skill.name : 'Unknown Skill'
  })

  const locationLabel = selectedLocation ? selectedLocation.name : 'Not selected'

  return {
    ...form.value,
    company: useUserStore().company,
    location: locationLabel,
    skills: selectedSkills,
    posted: new Date().toISOString().split('T')[0],
  }
})

const jobTypes = ['Full-time', 'Co-founder', 'Contract', 'Internship']
const modeOptions = ['Online', 'Offline', 'Hybrid']
const qualificationOptions = ['Postgraduate', 'Undergraduate', 'Phd', '10th', '12th']
const MarketOptions = ref([])
const RoleOptions = ref([])
// API Functions
async function getAllSkills() {
  try {
    skillsLoading.value = true
    const res = await fetch(`${baseUrl}/skills/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch skills`)
    }

    const data = await res.json()
    console.log('Skills response:', data)

    // Handle your current skills API format: {success: true, skills: [[id, name], [id, name]]}
    if (data.success && data.skills && Array.isArray(data.skills)) {
      skills.value = data.skills.map((skill) => ({
        id: skill[0], // skillid
        name: skill[1], // skillName
      }))
    } else {
      throw new Error('Invalid skills data format')
    }
  } catch (error) {
    console.error('Error fetching skills:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to load skills: ${error.message}`,
    })
    skills.value = [] // Set empty array as fallback
  } finally {
    skillsLoading.value = false
  }
}

async function getAllLocations() {
  try {
    locationsLoading.value = true
    const res = await fetch(`${baseUrl}/location/location`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch locations`)
    }

    const data = await res.json()
    console.log('Locations response:', data)

    // Handle locations API format: {success: true, locations: [[id, name], [id, name]]}
    if (data.success && data.locations && Array.isArray(data.locations)) {
      locations.value = data.locations.map((location) => ({
        id: location[0], // lid
        name: location[1], // lname
      }))
    } else {
      throw new Error('Invalid locations data format')
    }
  } catch (error) {
    console.error('Error fetching locations:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to load locations: ${error.message}`,
    })
    locations.value = [] // Set empty array as fallback
  } finally {
    locationsLoading.value = false
  }
}

async function getAllMarkets() {
  try {
    const res = await fetch(`${baseUrl}/markets/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()
    if (data.success && data.markets) {
      // Make sure MarketOptions is reactive and updated
      MarketOptions.value = data.markets.map((market) => ({
        label: market[1],
        value: market[0],
      }))
      console.log('Markets fetched successfully')
    }
  } catch (error) {
    console.error('Error fetching markets:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to load markets: ${error.message}`,
    })
  }
}

async function getAllRoles() {
  try {
    const res = await fetch(`${baseUrl}/roles/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()
    if (data.success && data.roles) {
      // Make sure MarketOptions is reactive and updated
      RoleOptions.value = data.roles.map((role) => ({
        label: role[1],
        value: role[0],
      }))
      console.log('Roles fetched successfully')
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to load roles: ${error.message}`,
    })
  }
}

// Validation Rules
const isRequired = (val) => !!val || 'This field is required'
const minLength = (n) => (val) => !val || val.length >= n || `Minimum ${n} characters`
const maxLength = (n) => (val) => !val || val.length <= n || `Maximum ${n} characters`

const isPositiveNumber = (val) => {
  return (val >= 0 && val <= 50) || 'Experience should be between 0-50 years'
}

const isPositiveOpenings = (val) => {
  return (val >= 1 && val <= 100) || 'Openings should be between 1-100'
}

const isSalaryValid = (val) => {
  if (!val || val < 1000) return 'Salary must be at least ₹1,000'
  if (val > 99990000) return 'Salary seems too high'
  return true
}

const validateExperienceRange = (val) => {
  if (!val) return true // Optional max experience
  if (form.value.experience_min && val < form.value.experience_min) {
    return 'Max experience should be greater than or equal to min experience'
  }
  return true
}

const validateSalaryRange = (val) => {
  if (!val) return true // Optional max salary
  if (form.value.salary_min && val < form.value.salary_min) {
    return 'Max salary should be greater than or equal to min salary'
  }
  return true
}

const validateEquityRange = (val) => {
  if (!val) return true // Optional max equity
  if (form.value.equity_min && val < form.value.equity_min) {
    return 'Max equity should be greater than or equal to min equity'
  }
  return true
}

onMounted(async () => {
  // Load skills and locations from backend
  await Promise.all([getAllSkills(), getAllLocations(), getAllMarkets(), getAllRoles()])

  // Set company data if available
  if (useUserStore().company) {
    form.value.companyName = useUserStore().company.name
    form.value.cid = useUserStore().company.cid
  }
})

async function handlePreview() {
  const success = await formRef.value.validate()
  if (!success) {
    $q.notify({
      type: 'negative',
      message: 'Please fix the form errors before previewing.',
    })
    return
  }

  isPreviewing.value = true
}

async function submitJob() {
  console.log('🔥 SUBMIT JOB FUNCTION CALLED!')

  isSubmitting.value = true

  try {
    // Backend derives uid and cid from authenticated user, so we don't send them
    const jobData = {
      title: form.value.title,
      bigDescription: form.value.bigDescription,
      smallDescription: form.value.smallDescription,
      job_type: form.value.job_type,
      mode_of_work: form.value.mode_of_work,
      experience_min: form.value.experience_min,
      experience_max: form.value.experience_max,
      salary_min: form.value.salary_min,
      salary_max: form.value.salary_max,
      equity_min: form.value.equity_min || 0,
      equity_max: form.value.equity_max || 0,
      opening: form.value.opening,
      qualification: form.value.qualification,
      job_markets: form.value.job_markets,
      job_roles: form.value.job_roles,
      skillids: form.value.skillids,
      lid: form.value.lid,
    }

    console.log(jobData)
    const result = await jobsStore.postJob(jobData)

    console.log('Job submission result:', result)
    console.log('Job data being submitted:', jobData)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Job posted successfully!',
      })

      resetForm()
      isPreviewing.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: result.message,
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message,
    })
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.value = {
    title: '',
    companyName: useUserStore().company?.name || '',
    job_type: '',
    mode_of_work: '',
    experience_min: 0,
    experience_max: 0,
    salary_min: 0,
    salary_max: 0,
    equity_min: 0,
    equity_max: 0,
    opening: 1,
    qualification: null,
    job_markets: [],
    job_roles: [],
    lid: null,
    cid: useUserStore().company?.cid || null,
    skillids: [],
    bigDescription: '',
    smallDescription: '',
  }

  formRef.value?.resetValidation()
}
</script>

<style scoped>
.post-job-card {
  width: 100%;
  margin: 0 auto;
  padding: 32px;
  background-color: white;
}

.form-header {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.form-entry {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
  min-height: 0;
}

/* Unified Input & Select Styling */
.q-input,
.q-select {
  background: white;
}

.q-input :deep(.q-field__control),
.q-select :deep(.q-field__control) {
  background: white !important;
  border: 1px solid #d1d5db !important;
  border-radius: 8px !important;
  min-height: 56px;
}

.q-input :deep(.q-field__control):before,
.q-select :deep(.q-field__control):before {
  border: none !important;
}

.q-input :deep(.q-field__control):after,
.q-select :deep(.q-field__control):after {
  border: 2px solid #000000 !important;
  border-radius: 8px !important;
}

.q-input :deep(.q-field__label),
.q-select :deep(.q-field__label) {
  color: #374151 !important;
  font-weight: 500 !important;
}

.q-input :deep(.q-field__native),
.q-select :deep(.q-field__native) {
  color: #000000 !important;
}

/* Focus States */
.q-field--focused :deep(.q-field__control) {
  border-color: #000000 !important;
  box-shadow: 0 0 0 1px #000000 !important;
}

/* Disabled States */
.q-input :deep(.q-field--disabled),
.q-select :deep(.q-field--disabled) {
  opacity: 0.7 !important;
}

.q-input :deep(.q-field--disabled .q-field__control),
.q-select :deep(.q-field--disabled .q-field__control) {
  background: #f9fafb !important;
  color: #6b7280 !important;
}

/* Buttons */
.q-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: normal;
  border-radius: 8px;
}

.q-btn.bg-primary {
  background-color: #1a1a1a !important;
  color: white !important;
}

.q-btn.bg-primary:hover {
  background-color: #333 !important;
}

.q-btn--flat {
  color: #1a1a1a;
}

.q-btn--flat:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Range input styles */
.experience-range,
.salary-range,
.equity-range {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.experience-input,
.salary-input,
.equity-input {
  flex: 1;
}

/* Responsive */
@media (max-width: 600px) {
  .post-job-card {
    padding: 24px 16px;
  }

  .experience-range,
  .salary-range,
  .equity-range {
    flex-direction: column;
    gap: 8px;
  }

  .experience-input,
  .salary-input,
  .equity-input {
    width: 100%;
  }
}
</style>
