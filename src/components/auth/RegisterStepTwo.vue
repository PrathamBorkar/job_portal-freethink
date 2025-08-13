<script setup>
import { ref, defineProps, onMounted } from 'vue'

const props = defineProps({
  StepTwoUpdate: {
    type: Function,
    required: true,
  },
})

const otp = ref('')
const otpRef = ref(null)
const loading = ref(false)
const countdown = ref(60)
const canResend = ref(false)

// Validation rules
const otpRules = [
  (val) => !!val || 'OTP is required',
  (val) => /^\d{6}$/.test(val) || 'OTP must be exactly 6 digits',
]

// Countdown timer for resend
const startCountdown = () => {
  canResend.value = false
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      canResend.value = true
      clearInterval(timer)
    }
  }, 1000)
}

// Format OTP input to only allow numbers
const formatOTP = (value) => {
  return value.replace(/\D/g, '').slice(0, 6)
}

const onOTPInput = (value) => {
  otp.value = formatOTP(value)
}

const onSubmit = async () => {
  // Validate OTP
  otpRef.value.validate()

  if (otpRef.value.hasError) {
    return
  }

  loading.value = true

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  try {
    props.StepTwoUpdate(otp.value)
    otp.value = ''
  } catch (error) {
    console.error('OTP verification failed:', error)
  } finally {
    loading.value = false
  }
}

const resendOTP = async () => {
  if (!canResend.value) return

  // Simulate resend API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  startCountdown()

  // Show success message (you could use Quasar notify here)
  console.log('OTP resent successfully')
}

onMounted(() => {
  startCountdown()
})
</script>

<template>
  <div class="step-container">
    <q-card class="step-card">
      <q-card-section class="step-header">
        <div class="step-badge">Step 2 of 3</div>
        <div class="otp-icon-wrapper">
          <q-icon name="mark_email_read" class="otp-icon" />
        </div>
        <div class="text-h4 text-weight-bold">Verify Your Email</div>
        <div class="text-subtitle2 text-grey-6 q-mt-sm">
          We've sent a 6-digit verification code to your email address
        </div>
      </q-card-section>

      <q-card-section class="step-form">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            ref="otpRef"
            :model-value="otp"
            @update:model-value="onOTPInput"
            type="text"
            label="Enter 6-Digit OTP"
            outlined
            :rules="otpRules"
            lazy-rules
            class="otp-input"
            maxlength="6"
            input-class="text-center text-h5 letter-spacing-lg"
          >
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
          </q-input>

          <div class="otp-info q-mt-md">
            <div class="text-body2 text-grey-6 text-center">
              <q-icon name="info" class="q-mr-xs" />
              Check your email inbox and spam folder
            </div>
          </div>

          <div class="step-actions q-mt-xl">
            <q-btn
              type="submit"
              :loading="loading"
              color="dark"
              size="lg"
              class="full-width step-btn"
              :disable="loading || !otp || otp.length !== 6"
            >
              <span v-if="!loading">Verify & Continue</span>
              <q-spinner-dots v-if="loading" />
            </q-btn>
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="step-footer">
        <div class="resend-section">
          <div class="text-body2 text-grey-6 text-center q-mb-sm">Didn't receive the code?</div>
          <q-btn
            flat
            no-caps
            :color="canResend ? 'dark' : 'grey'"
            :disable="!canResend"
            class="resend-btn"
            @click="resendOTP"
          >
            <span v-if="canResend">Resend OTP</span>
            <span v-else>Resend in {{ countdown }}s</span>
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
  max-width: 480px;
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
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.otp-icon-wrapper {
  margin-bottom: 16px;
}

.otp-icon {
  font-size: 48px;
  color: #212121;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 50%;
}

.step-form {
  padding: 16px 32px 24px 32px;
  background: white;
}

.otp-input {
  margin-bottom: 8px;
}

.otp-input :deep(.q-field__control) {
  border-radius: 8px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
  height: 64px;
}

.otp-input :deep(.q-field__control):hover {
  border-color: #bdbdbd;
  background: #f5f5f5;
}

.otp-input :deep(.q-field--focused .q-field__control) {
  border-color: #212121;
  box-shadow: 0 0 0 3px rgba(33, 33, 33, 0.1);
  background: white;
}

.otp-input :deep(.q-field__label) {
  color: #616161;
  font-weight: 500;
}

.otp-input :deep(.q-field--focused .q-field__label) {
  color: #212121;
}

.otp-input :deep(.q-field__prepend) {
  color: #757575;
}

.otp-input :deep(.q-field--focused .q-field__prepend) {
  color: #212121;
}

.otp-input :deep(.q-field__native) {
  color: #212121;
  font-weight: 600;
  font-size: 24px;
  letter-spacing: 4px;
}

.otp-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
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

.step-btn:hover:not(:disabled) {
  background: #424242;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 33, 33, 0.3);
}

.step-btn:active {
  transform: translateY(0);
}

.step-btn:disabled {
  background: #e0e0e0;
  color: #9e9e9e;
}

.step-footer {
  padding: 16px 32px 24px 32px;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #f0f0f0;
}

.resend-section {
  text-align: center;
}

.resend-btn {
  font-weight: 600;
  text-transform: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.resend-btn:not(:disabled):hover {
  background: rgba(33, 33, 33, 0.05);
  transform: translateY(-1px);
}

.resend-btn:disabled {
  opacity: 0.6;
}

/* Error states */
.otp-input :deep(.q-field--error .q-field__control) {
  border-color: #f44336;
  background: #fef7f7;
}

.otp-input :deep(.q-field--error .q-field__label) {
  color: #f44336;
}

.otp-input :deep(.q-field--error .q-field__prepend) {
  color: #f44336;
}

/* Success states */
.otp-input :deep(.q-field--filled:not(.q-field--error) .q-field__control) {
  border-color: #4caf50;
  background: #f8fff8;
}

/* Loading state */
.step-btn.q-btn--loading {
  pointer-events: none;
}

/* Responsive design */
@media (max-width: 480px) {
  .step-container {
    padding: 16px;
  }

  .step-header,
  .step-form,
  .step-footer {
    padding-left: 24px;
    padding-right: 24px;
  }

  .step-card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .otp-icon {
    font-size: 40px;
    padding: 12px;
  }

  .otp-input :deep(.q-field__native) {
    font-size: 20px;
    letter-spacing: 3px;
  }
}

/* Animation for countdown */
.resend-btn {
  animation: none;
}

.resend-btn:disabled {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
