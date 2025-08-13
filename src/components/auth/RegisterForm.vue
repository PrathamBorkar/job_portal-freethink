<script setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user-store'
import { useQuasar } from 'quasar'
import RegisterStepOne from './RegisterStepOne.vue'
import RegisterStepTwo from './RegisterStepTwo.vue'
import RegisterStepThree from './RegisterStepThree.vue'
import RegisterStepFour from './RegisterStepFour.vue'
import RegisterStepFive from './RegisterStepFive.vue'
import RegisterStepSix from './RegisterStepSix.vue'
import RegisterStepSeven from './RegisterStepSeven.vue'

const $q = useQuasar()
const router = useRouter()

// Computed property for conditional timeline steps
const timelineSteps = computed(() => {
  if (formData.role === 'recruiter') {
    return [
      { title: 'Personal Information', subtitle: 'Basic details', icon: 'person' },
      { title: 'OTP Verification', subtitle: 'Email confirmation', icon: 'lock' },
      { title: 'Select Role', subtitle: 'Choose your path', icon: 'assignment_ind' },
      { title: 'Company Details', subtitle: 'Organization info', icon: 'business' },
    ]
  } else if (formData.role === 'applicant') {
    return [
      { title: 'Personal Information', subtitle: 'Basic details', icon: 'person' },
      { title: 'OTP Verification', subtitle: 'Email confirmation', icon: 'lock' },
      { title: 'Select Role', subtitle: 'Choose your path', icon: 'assignment_ind' },
      { title: 'Education Details', subtitle: 'Academic background', icon: 'school' },
      { title: 'Skills Selection', subtitle: 'Your expertise', icon: 'build' },
      { title: 'Experience Details', subtitle: 'Work history', icon: 'work' },
    ]
  } else {
    // Default to first 3 steps before role selection
    return [
      { title: 'Personal Information', subtitle: 'Basic details', icon: 'person' },
      { title: 'OTP Verification', subtitle: 'Email confirmation', icon: 'lock' },
      { title: 'Select Role', subtitle: 'Choose your path', icon: 'assignment_ind' },
    ]
  }
})

// Computed property for current step index
const currentStep = computed(() => {
  if (!StepData.stepOne) return 0
  if (!StepData.stepTwo) return 1
  if (!StepData.stepThree) return 2

  if (formData.role === 'recruiter') {
    if (!StepData.stepFour) return 3
    return 4
  } else if (formData.role === 'applicant') {
    if (!StepData.stepFive) return 3
    if (!StepData.stepSix) return 4
    if (!StepData.stepSeven) return 5
    return 6
  }

  return 3
})

const StepData = reactive({
  stepOne: false,
  stepTwo: false,
  stepThree: false,
  stepFour: false,
  stepFive: false,
  stepSix: false,
  stepSeven: false,
})

const formData = reactive({
  name: '',
  email: '',
  password: '',
  phone: '',
  role: '',
  cid: null,
  company: {
    name: '',
    location: '',
    description: '',
  },
  education: {
    degree: '',
    institution: '',
    field_of_study: '',
    start_date_degree: '',
    end_date_degree: '',
    grade_value: '',
    grade_type: '',
    education_level: '',
  },
  experience: {
    expName: '',
    role: '',
    start: '',
    end: '',
  },
  skillids: [],
})

const StepOneUpdate = async (data) => {
  formData.email = data.email
  formData.password = data.password
  formData.name = data.name
  formData.phone = data.phone

  try {
    const otpResult = await useUserStore().sendOTP(formData.email)
    if (otpResult.success) {
      $q.notify({
        type: 'positive',
        message: otpResult.message || 'OTP sent successfully! Please check your email.',
        position: 'bottom-right',
        timeout: 2000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
    } else {
      $q.notify({
        type: 'negative',
        message: otpResult.message || 'Failed to send OTP please try again.',
        position: 'bottom-right',
        timeout: 4000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
      return
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'An error occurred while sending OTP.',
      position: 'bottom-right',
      timeout: 4000,
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
    })
    return
  }

  StepData.stepOne = true
}

const StepTwoUpdate = async (data) => {
  try {
    const otpResult = await useUserStore().verifyOTP(formData.email, data)

    if (otpResult.success) {
      $q.notify({
        type: 'positive',
        message: otpResult.message || 'OTP verified successfully! Please continue.',
        position: 'bottom-right',
        timeout: 2000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
    } else {
      $q.notify({
        type: 'negative',
        message: otpResult.message || 'OTP verification failed. Please try again.',
        position: 'bottom-right',
        timeout: 4000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
      return
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'An error occurred while verifying OTP.',
      position: 'bottom-right',
      timeout: 4000,
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
    })
    return
  }

  StepData.stepTwo = true
}

const StepThreeUpdate = (data) => {
  formData.role = data
  StepData.stepThree = true
}

const StepFourUpdate = async (data) => {
  formData.cid = data.cid
  formData.company.name = data.companyName
  formData.company.location = data.companyLocation
  formData.company.description = data.companyDescription

  let payload = {}

  if (formData.cid === null) {
    payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      cid: formData.cid,
      company: formData.company,
      education: {},
      experience: {},
      skillids: [],
    }
  } else {
    payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      cid: formData.cid,
      company: {},
      education: {},
      experience: {},
      skillids: [],
    }
  }

  try {
    const recruiterResult = await useUserStore().register(payload)

    if (recruiterResult.success) {
      $q.notify({
        type: 'positive',
        message: recruiterResult.message || 'Recruiter registration successful! Redirecting...',
        position: 'bottom-right',
        timeout: 2000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })

      router.push('/recruiter')
    } else {
      $q.notify({
        type: 'negative',
        message: recruiterResult.message || 'Recruiter registration failed. Please try again.',
        position: 'bottom-right',
        timeout: 4000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
      router.push('/')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'An unexpected error occurred during recruiter registration.',
      position: 'bottom-right',
      timeout: 4000,
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
    })
    console.error('Recruiter registration error:', error)
    router.push('/')
  }

  StepData.stepFour = true
}

const StepFiveUpdate = (data) => {
  formData.education.degree = data.degree
  formData.education.institution = data.institution
  formData.education.field_of_study = data.field_of_study
  formData.education.start_date_degree = data.start_date_degree
  formData.education.end_date_degree = data.end_date_degree
  formData.education.grade_value = data.grade_value
  formData.education.grade_type = data.grade_type
  formData.education.education_level = data.education_level

  StepData.stepFive = true
}

const StepSixUpdate = (data) => {
  formData.skillids = data
  StepData.stepSix = true
}

const StepSevenUpdate = async (data) => {
  formData.experience.expName = data.expName
  formData.experience.role = data.role
  formData.experience.start = data.start
  formData.experience.end = data.end

  let payload = {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    phone: formData.phone,
    role: formData.role,
    cid: formData.cid,
    company: {},
    education: formData.education,
    experience: formData.experience,
    skillids: formData.skillids,
  }

  try {
    const applicantResult = await useUserStore().register(payload)

    if (applicantResult.success) {
      $q.notify({
        type: 'positive',
        message: applicantResult.message || 'Applicant registration successful! Redirecting...',
        position: 'bottom-right',
        timeout: 2000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })

      router.push('/applicant')
    } else {
      $q.notify({
        type: 'negative',
        message: applicantResult.message || 'Applicant registration failed. Please try again.',
        position: 'bottom-right',
        timeout: 4000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
      router.push('/')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'An unexpected error occurred during applicant registration.',
      position: 'bottom-right',
      timeout: 4000,
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
    })
    console.error('Applicant registration error:', error)
    router.push('/')
  }

  StepData.stepSeven = true
}
</script>

<template>
  <div class="register-container">
    <div class="register-content">
      <!-- Main Form Section -->
      <div class="form-section">
        <div class="form-wrapper">
          <RegisterStepOne
            v-if="
              !StepData.stepOne &&
              !StepData.stepTwo &&
              !StepData.stepThree &&
              !StepData.stepFour &&
              !StepData.stepFive
            "
            :StepOneUpdate="StepOneUpdate"
          />

          <RegisterStepTwo
            v-if="
              StepData.stepOne &&
              !StepData.stepTwo &&
              !StepData.stepThree &&
              !StepData.stepFour &&
              !StepData.stepFive
            "
            :StepTwoUpdate="StepTwoUpdate"
          />

          <RegisterStepThree
            v-if="
              StepData.stepOne &&
              StepData.stepTwo &&
              !StepData.stepThree &&
              !StepData.stepFour &&
              !StepData.stepFive
            "
            :StepThreeUpdate="StepThreeUpdate"
          />

          <RegisterStepFour
            v-if="
              StepData.stepOne &&
              StepData.stepTwo &&
              StepData.stepThree &&
              formData.role == 'recruiter' &&
              !StepData.stepFour
            "
            :StepFourUpdate="StepFourUpdate"
          />

          <RegisterStepFive
            v-if="
              StepData.stepOne &&
              StepData.stepTwo &&
              StepData.stepThree &&
              formData.role == 'applicant' &&
              !StepData.stepFive
            "
            :StepFiveUpdate="StepFiveUpdate"
          />

          <RegisterStepSix
            v-if="
              StepData.stepOne &&
              StepData.stepTwo &&
              StepData.stepThree &&
              formData.role == 'applicant' &&
              StepData.stepFive &&
              !StepData.stepSix
            "
            :StepSixUpdate="StepSixUpdate"
          />

          <RegisterStepSeven
            v-if="
              StepData.stepOne &&
              StepData.stepTwo &&
              StepData.stepThree &&
              formData.role == 'applicant' &&
              StepData.stepFive &&
              StepData.stepSix &&
              !StepData.stepSeven
            "
            :StepSevenUpdate="StepSevenUpdate"
          />
        </div>
      </div>

      <!-- Timeline Section -->
      <div class="timeline-section">
        <div class="timeline-wrapper">
          <div class="timeline-header">
            <h2 class="timeline-title">Registration Progress</h2>
            <p class="timeline-subtitle">Complete your profile step by step</p>
          </div>

          <div class="timeline-container">
            <div
              v-for="(step, index) in timelineSteps"
              :key="index"
              class="timeline-item"
              :class="{
                completed: index < currentStep,
                active: index === currentStep,
                pending: index > currentStep,
              }"
            >
              <div class="timeline-icon-wrapper">
                <q-icon :name="index < currentStep ? 'check' : step.icon" class="timeline-icon" />
              </div>
              <div class="timeline-content">
                <h3 class="timeline-step-title">{{ step.title }}</h3>
                <p class="timeline-step-subtitle">{{ step.subtitle }}</p>
              </div>
              <div v-if="index < timelineSteps.length - 1" class="timeline-connector"></div>
            </div>
          </div>

          <div class="progress-indicator">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${(currentStep / timelineSteps.length) * 100}%` }"
              ></div>
            </div>
            <p class="progress-text">
              {{ currentStep }} of {{ timelineSteps.length }} steps completed
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="register-navigation">
      <q-btn flat no-caps color="dark" class="nav-btn" @click="router.push('/')">
        <q-icon name="arrow_back" class="q-mr-sm" />
        Back
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
}

.register-content {
  display: flex;
  min-height: 100vh;
}

/* Form Section */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
}

.form-wrapper {
  width: 100%;
  max-width: 500px;
}

/* Timeline Section */
.timeline-section {
  width: 400px;
  background: #212121;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.timeline-wrapper {
  width: 100%;
  max-width: 320px;
}

.timeline-header {
  text-align: center;
  margin-bottom: 40px;
}

.timeline-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
}

.timeline-subtitle {
  font-size: 14px;
  color: #bdbdbd;
  margin: 0;
}

.timeline-container {
  position: relative;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-bottom: 32px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.timeline-item.completed .timeline-icon-wrapper {
  background: #4caf50;
  color: white;
}

.timeline-item.active .timeline-icon-wrapper {
  background: white;
  color: #212121;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.timeline-item.pending .timeline-icon-wrapper {
  background: #424242;
  color: #757575;
}

.timeline-icon {
  font-size: 20px;
}

.timeline-content {
  flex: 1;
  padding-top: 4px;
}

.timeline-step-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  transition: color 0.3s ease;
}

.timeline-item.completed .timeline-step-title {
  color: #4caf50;
}

.timeline-item.active .timeline-step-title {
  color: white;
}

.timeline-item.pending .timeline-step-title {
  color: #757575;
}

.timeline-step-subtitle {
  font-size: 13px;
  margin: 0;
  transition: color 0.3s ease;
}

.timeline-item.completed .timeline-step-subtitle {
  color: #81c784;
}

.timeline-item.active .timeline-step-subtitle {
  color: #e0e0e0;
}

.timeline-item.pending .timeline-step-subtitle {
  color: #616161;
}

.timeline-connector {
  position: absolute;
  left: 23px;
  top: 48px;
  width: 2px;
  height: 32px;
  background: #424242;
  transition: background 0.3s ease;
}

.timeline-item.completed .timeline-connector {
  background: #4caf50;
}

.progress-indicator {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #424242;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #424242;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 12px;
  color: #bdbdbd;
  text-align: center;
  margin: 0;
}

/* Navigation */
.register-navigation {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .register-content {
    flex-direction: column;
  }

  .timeline-section {
    width: 100%;
    order: -1;
    padding: 24px 40px;
  }

  .timeline-container {
    display: flex;
    overflow-x: auto;
    gap: 24px;
    padding-bottom: 16px;
  }

  .timeline-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-bottom: 0;
    min-width: 120px;
  }

  .timeline-icon-wrapper {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .timeline-connector {
    display: none;
  }

  .form-section {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .timeline-section {
    padding: 20px;
  }

  .form-section {
    padding: 20px;
  }

  .register-navigation {
    top: 16px;
    left: 16px;
  }

  .timeline-title {
    font-size: 20px;
  }

  .timeline-step-title {
    font-size: 14px;
  }

  .timeline-step-subtitle {
    font-size: 12px;
  }
}
</style>
