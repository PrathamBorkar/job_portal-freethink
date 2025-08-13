<script setup>
import { ref, defineProps, onMounted, computed } from 'vue'
const baseUrl = import.meta.env.VITE_API_BASE_URL

const props = defineProps({
  StepFourUpdate: {
    type: Function,
    required: true,
  },
})

const companies = ref([])
const loading = ref(false)
const fetchingCompanies = ref(true)

// Form fields
const companyId = ref(null)
const companyName = ref('')
const companyLocation = ref('')
const companyDescription = ref('')

// Form refs for validation
const companyNameRef = ref(null)
const companyLocationRef = ref(null)
const companyDescriptionRef = ref(null)

// Show new company form when no existing company is selected
const showNewCompanyForm = computed(() => {
  return !companyId.value
})

// Form validation - either existing company OR new company fields (not both)
const isFormValid = computed(() => {
  // Scenario 1: Existing company is selected
  if (companyId.value) {
    return true
  }
  // Scenario 2: New company form is filled out (all fields required)
  if (
    !companyId.value &&
    companyName.value.trim() &&
    companyLocation.value.trim() &&
    companyDescription.value.trim()
  ) {
    return true
  }
  // Otherwise form is invalid
  return false
})

// Validation rules for new company form
const companyNameRules = [
  (val) => !!val || 'Company name is required',
  (val) => val.length >= 2 || 'Company name must be at least 2 characters',
]

const companyLocationRules = [
  (val) => !!val || 'Company location is required',
  (val) => val.length >= 2 || 'Location must be at least 2 characters',
]

const companyDescriptionRules = [
  (val) => !!val || 'Company description is required',
  (val) => val.length >= 10 || 'Description must be at least 10 characters',
]

async function GetAllCompanies() {
  try {
    const res = await fetch(`${baseUrl}/company/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const responseData = await res.json()
    if (!responseData.success) {
      console.error('Failed to fetch companies:', responseData.message)
      return []
    }
    return responseData.companies
  } catch (error) {
    console.error('Error fetching companies:', error)
    return []
  }
}

onMounted(async () => {
  try {
    companies.value = await GetAllCompanies()
    console.log('Companies fetched successfully:', companies.value)
  } catch (err) {
    console.error('Unhandled error in step four mounted:', err)
  } finally {
    fetchingCompanies.value = false
  }
})

// Clear new company form when existing company is selected
const onCompanySelect = () => {
  if (companyId.value) {
    companyName.value = ''
    companyLocation.value = ''
    companyDescription.value = ''
    // Clear any validation errors
    companyNameRef.value?.resetValidation()
    companyLocationRef.value?.resetValidation()
    companyDescriptionRef.value?.resetValidation()
  }
}

// Clear selected company when user starts typing in new company fields
const onNewCompanyInput = () => {
  if (companyName.value || companyLocation.value || companyDescription.value) {
    companyId.value = null
  }
}

const onSubmit = async () => {
  // Early return if form is not valid or already loading
  if (!isFormValid.value || loading.value) {
    return
  }

  // If creating new company, validate form fields
  if (!companyId.value) {
    companyNameRef.value?.validate()
    companyLocationRef.value?.validate()
    companyDescriptionRef.value?.validate()

    if (
      companyNameRef.value?.hasError ||
      companyLocationRef.value?.hasError ||
      companyDescriptionRef.value?.hasError
    ) {
      return
    }
  }

  loading.value = true

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    props.StepFourUpdate({
      cid: companyId.value ? parseInt(companyId.value) : null,
      companyName: companyName.value,
      companyLocation: companyLocation.value,
      companyDescription: companyDescription.value,
    })

    // Clear form
    companyId.value = null
    companyName.value = ''
    companyLocation.value = ''
    companyDescription.value = ''
  } catch (error) {
    console.error('Error in form submission:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="step-container">
    <q-card class="step-card">
      <q-card-section class="step-header">
        <div class="step-badge">Step 4 of 4</div>
        <div class="text-h4 text-weight-bold">Company Details</div>
        <div class="text-subtitle2 text-grey-6 q-mt-sm">Select your company or add a new one</div>
      </q-card-section>

      <q-card-section class="step-form">
        <!-- Existing Company Selection -->
        <div class="company-selection-section">
          <h3 class="section-title">
            <q-icon name="business" class="q-mr-sm" />
            Select Existing Company
          </h3>

          <q-select
            v-model="companyId"
            :options="companies.map((company) => ({ label: company[1], value: company[0] }))"
            :loading="fetchingCompanies"
            label="Choose from existing companies"
            outlined
            emit-value
            map-options
            clearable
            class="company-select"
            @update:model-value="onCompanySelect"
          >
            <template v-slot:prepend>
              <q-icon name="domain" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No companies available </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Divider -->
        <div class="divider-section">
          <div class="divider-line"></div>
          <span class="divider-text">OR</span>
          <div class="divider-line"></div>
        </div>

        <!-- New Company Form -->
        <div class="new-company-section">
          <h3 class="section-title">
            <q-icon name="add_business" class="q-mr-sm" />
            Add New Company
          </h3>

          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              ref="companyNameRef"
              v-model="companyName"
              type="text"
              label="Company Name"
              outlined
              :rules="showNewCompanyForm ? companyNameRules : []"
              :disable="!!companyId"
              lazy-rules
              class="step-input"
              @update:model-value="onNewCompanyInput"
            >
              <template v-slot:prepend>
                <q-icon name="business_center" />
              </template>
            </q-input>

            <q-input
              ref="companyLocationRef"
              v-model="companyLocation"
              type="text"
              label="Company Location"
              outlined
              :rules="showNewCompanyForm ? companyLocationRules : []"
              :disable="!!companyId"
              lazy-rules
              class="step-input"
              @update:model-value="onNewCompanyInput"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" />
              </template>
            </q-input>

            <q-input
              ref="companyDescriptionRef"
              v-model="companyDescription"
              type="textarea"
              label="Company Description"
              outlined
              :rules="showNewCompanyForm ? companyDescriptionRules : []"
              :disable="!!companyId"
              lazy-rules
              rows="3"
              class="step-input"
              @update:model-value="onNewCompanyInput"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>

            <div class="step-actions q-mt-xl">
              <q-btn
                type="submit"
                :loading="loading"
                :disable="!isFormValid || loading"
                color="dark"
                size="lg"
                class="full-width step-btn"
                @click.prevent="onSubmit"
              >
                <span v-if="!loading">Complete Registration</span>
                <q-spinner-dots v-if="loading" />
              </q-btn>
            </div>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.step-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 20px;
}

.step-card {
  width: 100%;
  max-width: 580px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.step-header {
  padding: 32px 32px 16px 32px;
  background: white;
  border-radius: 12px 12px 0 0;
  text-align: center;
}

.step-badge {
  display: inline-block;
  background: #212121;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-form {
  padding: 16px 32px 32px 32px;
  background: white;
}

.company-selection-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.company-select :deep(.q-field__control) {
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.company-select :deep(.q-field__control):hover {
  border-color: #bdbdbd;
  background: #f5f5f5;
}

.company-select :deep(.q-field--focused .q-field__control) {
  border-color: #212121;
  box-shadow: 0 0 0 2px rgba(33, 33, 33, 0.1);
  background: white;
}

.company-select :deep(.q-field__label) {
  color: #616161;
  font-weight: 500;
}

.company-select :deep(.q-field--focused .q-field__label) {
  color: #212121;
}

.company-select :deep(.q-field__prepend) {
  color: #757575;
}

.company-select :deep(.q-field--focused .q-field__prepend) {
  color: #212121;
}

.divider-section {
  display: flex;
  align-items: center;
  margin: 32px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider-text {
  padding: 0 16px;
  color: #9e9e9e;
  font-size: 14px;
  font-weight: 500;
  background: white;
}

.new-company-section {
  transition: opacity 0.3s ease;
}

.new-company-section.disabled {
  opacity: 0.5;
}

.step-input {
  margin-bottom: 8px;
}

.step-input :deep(.q-field__control) {
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.step-input :deep(.q-field__control):hover {
  border-color: #bdbdbd;
  background: #f5f5f5;
}

.step-input :deep(.q-field--focused .q-field__control) {
  border-color: #212121;
  box-shadow: 0 0 0 2px rgba(33, 33, 33, 0.1);
  background: white;
}

.step-input :deep(.q-field--disabled .q-field__control) {
  background: #f0f0f0;
  border-color: #e8e8e8;
}

.step-input :deep(.q-field__label) {
  color: #616161;
  font-weight: 500;
}

.step-input :deep(.q-field--focused .q-field__label) {
  color: #212121;
}

.step-input :deep(.q-field__prepend) {
  color: #757575;
}

.step-input :deep(.q-field--focused .q-field__prepend) {
  color: #212121;
}

.step-input :deep(.q-field--disabled .q-field__prepend) {
  color: #bdbdbd;
}

.step-actions {
  padding-top: 16px;
}

.step-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  font-size: 16px;
  padding: 14px 0;
  background: #212121;
  transition: all 0.3s ease;
}

.step-btn:not([disabled]):hover {
  background: #424242;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 33, 33, 0.3);
}

.step-btn:active {
  transform: translateY(0);
}

.step-btn[disabled] {
  background: #e0e0e0 !important;
  color: #bdbdbd !important;
  transform: none !important;
  box-shadow: none !important;
  pointer-events: none !important;
  cursor: not-allowed !important;
}

/* Error states */
.step-input :deep(.q-field--error .q-field__control) {
  border-color: #f44336;
  background: #fef7f7;
}

.step-input :deep(.q-field--error .q-field__label) {
  color: #f44336;
}

.step-input :deep(.q-field--error .q-field__prepend) {
  color: #f44336;
}

/* Responsive design */
@media (max-width: 480px) {
  .step-container {
    padding: 16px;
  }

  .step-header,
  .step-form {
    padding-left: 24px;
    padding-right: 24px;
  }

  .step-card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .section-title {
    font-size: 16px;
  }
}

/* Loading states for select */
.company-select :deep(.q-field__append .q-spinner) {
  color: #212121;
}
</style>
