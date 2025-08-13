<script setup>
import { reactive, ref, defineProps } from 'vue'

const props = defineProps({
  StepSevenUpdate: {
    type: Function,
    required: true,
  },
})

const expData = reactive({
  expName: '',
  role: '',
  start: '',
  end: '',
})

const loading = ref(false)
const dateError = ref(null)

const onSubmit = () => {
  // Reset previous errors
  dateError.value = null

  // Validate dates
  if (expData.start && expData.end && new Date(expData.start) > new Date(expData.end)) {
    dateError.value = 'End date must be after start date'
    return
  }

  loading.value = true

  // Simulate API call delay
  setTimeout(() => {
    props.StepSevenUpdate(expData)
    loading.value = false
  }, 800)
}
</script>

<template>
  <div class="step-container">
    <q-card class="step-card">
      <q-card-section class="step-header">
        <div class="step-badge">Step 6 of 6</div>
        <div class="text-h4 text-weight-bold">Experience Details</div>
        <div class="text-subtitle2 text-grey-6 q-mt-sm">Add your professional work experience</div>
      </q-card-section>

      <q-card-section class="step-form">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="expData.expName"
            type="text"
            label="Company/Organization"
            outlined
            :rules="[(val) => !!val || 'This field is required']"
            lazy-rules
            class="step-input"
          >
            <template v-slot:prepend>
              <q-icon name="business" />
            </template>
          </q-input>

          <q-input
            v-model="expData.role"
            type="text"
            label="Your Role/Position"
            outlined
            :rules="[(val) => !!val || 'This field is required']"
            lazy-rules
            class="step-input"
          >
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
          </q-input>

          <div class="row q-gutter-md">
            <q-input
              v-model="expData.start"
              type="date"
              label="Start Date"
              outlined
              :rules="[(val) => !!val || 'Start date is required']"
              lazy-rules
              class="step-input col"
            >
              <template v-slot:prepend>
                <q-icon name="event_available" />
              </template>
            </q-input>

            <q-input
              v-model="expData.end"
              type="date"
              label="End Date"
              outlined
              :rules="[(val) => !!val || 'End date is required']"
              lazy-rules
              class="step-input col"
            >
              <template v-slot:prepend>
                <q-icon name="event_busy" />
              </template>
            </q-input>
          </div>

          <div v-if="dateError" class="text-negative q-mb-md">
            <q-icon name="error" class="q-mr-xs" />
            {{ dateError }}
          </div>

          <div class="step-actions q-mt-xl">
            <q-btn
              type="submit"
              :loading="loading"
              color="dark"
              size="lg"
              class="full-width step-btn"
            >
              <span v-if="!loading">Complete Registration</span>
              <q-spinner-dots v-if="loading" />
            </q-btn>
          </div>
        </q-form>
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

.step-btn:hover {
  background: #424242;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 33, 33, 0.3);
}

.step-btn:active {
  transform: translateY(0);
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
}
</style>
