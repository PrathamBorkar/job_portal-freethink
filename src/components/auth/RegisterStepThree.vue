<script setup>
import { ref, defineProps, computed } from 'vue'

const props = defineProps({
  StepThreeUpdate: {
    type: Function,
    required: true,
  },
})

const role = ref('')
const loading = ref(false)

const isFormValid = computed(() => {
  return role.value !== ''
})

const onSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  props.StepThreeUpdate(role.value)
  loading.value = false
  role.value = ''
}

const selectRole = (selectedRole) => {
  role.value = selectedRole
}
</script>

<template>
  <div class="step-container">
    <q-card class="step-card">
      <q-card-section class="step-header">
        <div class="step-badge">Step 3 of 3</div>
        <div class="text-h4 text-weight-bold">Choose Your Path</div>
        <div class="text-subtitle2 text-grey-6 q-mt-sm">
          Select your role to customize your registration experience
        </div>
      </q-card-section>

      <q-card-section class="step-form">
        <!-- Role Selection Cards -->
        <div class="role-selection">
          <!-- Applicant Card -->
          <div
            class="role-card"
            :class="{ selected: role === 'applicant' }"
            @click="selectRole('applicant')"
          >
            <div class="role-icon">
              <q-icon name="person_search" size="40px" />
            </div>
            <div class="role-content">
              <h3 class="role-title">Job Seeker</h3>
              <p class="role-subtitle">Looking for opportunities</p>
              <ul class="role-features">
                <li>Create professional profile</li>
                <li>Search and apply for jobs</li>
                <li>Track application status</li>
                <li>Connect with recruiters</li>
              </ul>
            </div>
            <div class="selection-indicator">
              <q-icon
                :name="role === 'applicant' ? 'check_circle' : 'radio_button_unchecked'"
                size="24px"
              />
            </div>
          </div>

          <!-- Recruiter Card -->
          <div
            class="role-card"
            :class="{ selected: role === 'recruiter' }"
            @click="selectRole('recruiter')"
          >
            <div class="role-icon">
              <q-icon name="business_center" size="40px" />
            </div>
            <div class="role-content">
              <h3 class="role-title">Recruiter</h3>
              <p class="role-subtitle">Hiring talented professionals</p>
              <ul class="role-features">
                <li>Post job openings</li>
                <li>Search candidate database</li>
                <li>Manage applications</li>
                <li>Schedule interviews</li>
              </ul>
            </div>
            <div class="selection-indicator">
              <q-icon
                :name="role === 'recruiter' ? 'check_circle' : 'radio_button_unchecked'"
                size="24px"
              />
            </div>
          </div>
        </div>

        <div class="step-actions q-mt-xl">
          <q-btn
            :loading="loading"
            :disable="!isFormValid || loading"
            color="dark"
            size="lg"
            class="full-width step-btn"
            @click="onSubmit"
          >
            <span v-if="!loading">Continue to Next Step</span>
            <q-spinner-dots v-if="loading" />
          </q-btn>
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
  max-width: 600px;
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

.role-selection {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.role-card:hover {
  border-color: #bdbdbd;
  background: #f5f5f5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.role-card.selected {
  border-color: #212121;
  background: #212121;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 33, 33, 0.3);
}

.role-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: white;
  margin-right: 24px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.role-card.selected .role-icon {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.role-card:not(.selected) .role-icon {
  color: #757575;
}

.role-content {
  flex: 1;
  padding-right: 16px;
}

.role-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  transition: color 0.3s ease;
}

.role-card:not(.selected) .role-title {
  color: #212121;
}

.role-subtitle {
  font-size: 14px;
  margin: 0 0 16px 0;
  opacity: 0.8;
  transition: color 0.3s ease;
}

.role-card:not(.selected) .role-subtitle {
  color: #616161;
}

.role-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.role-features li {
  font-size: 13px;
  margin-bottom: 6px;
  padding-left: 16px;
  position: relative;
  opacity: 0.9;
  transition: color 0.3s ease;
}

.role-features li::before {
  content: '•';
  position: absolute;
  left: 0;
  font-weight: bold;
}

.role-card:not(.selected) .role-features li {
  color: #757575;
}

.role-card:not(.selected) .role-features li::before {
  color: #212121;
}

.role-card.selected .role-features li::before {
  color: white;
}

.selection-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  transition: all 0.3s ease;
}

.role-card:not(.selected) .selection-indicator {
  color: #bdbdbd;
}

.role-card.selected .selection-indicator {
  color: white;
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
  background: #e0e0e0;
  color: #bdbdbd;
  transform: none;
  box-shadow: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .step-container {
    padding: 16px;
  }

  .step-header,
  .step-form {
    padding-left: 24px;
    padding-right: 24px;
  }

  .role-card {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
  }

  .role-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .role-content {
    padding-right: 0;
  }

  .selection-indicator {
    position: static;
    margin-top: 16px;
  }
}

@media (max-width: 480px) {
  .step-card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .role-card {
    padding: 20px 16px;
  }

  .role-icon {
    width: 60px;
    height: 60px;
  }

  .role-icon :deep(.q-icon) {
    font-size: 32px;
  }
}
</style>
