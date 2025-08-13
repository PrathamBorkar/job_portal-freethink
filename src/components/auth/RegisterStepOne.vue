<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  StepOneUpdate: {
    type: Function,
    required: true,
  },
})

const name = ref('')
const email = ref('')
const password = ref('')
const phone = ref('')
const showPassword = ref(false)

// Form refs for validation
const nameRef = ref(null)
const emailRef = ref(null)
const passwordRef = ref(null)
const phoneRef = ref(null)
const loading = ref(false)

// Validation rules
const nameRules = [
  (val) => !!val || 'Name is required',
  (val) => val.length >= 2 || 'Name must be at least 2 characters',
  (val) => /^[a-zA-Z\s]+$/.test(val) || 'Name should only contain letters and spaces',
]

const emailRules = [
  (val) => !!val || 'Email is required',
  (val) => /.+@.+\..+/.test(val) || 'Please enter a valid email address',
]

const passwordRules = [
  (val) => !!val || 'Password is required',
  (val) => val.length >= 8 || 'Password must be at least 8 characters',
  (val) =>
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val) ||
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
]

const phoneRules = [
  (val) => !!val || 'Phone number is required',
  (val) => /^[+]?[\d\s\-()]{10,}$/.test(val) || 'Please enter a valid phone number',
]

const onSubmit = async () => {
  // Validate all fields
  nameRef.value.validate()
  emailRef.value.validate()
  passwordRef.value.validate()
  phoneRef.value.validate()

  if (
    nameRef.value.hasError ||
    emailRef.value.hasError ||
    passwordRef.value.hasError ||
    phoneRef.value.hasError
  ) {
    return
  }

  loading.value = true

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  props.StepOneUpdate({
    name: name.value,
    email: email.value,
    password: password.value,
    phone: phone.value,
  })

  // Clear form
  name.value = ''
  email.value = ''
  password.value = ''
  phone.value = ''

  loading.value = false
}
</script>

<template>
  <div class="step-container">
    <q-card class="step-card">
      <q-card-section class="step-header">
        <div class="step-badge">Step 1 of 3</div>
        <div class="text-h4 text-weight-bold">Create Your Account</div>
        <div class="text-subtitle2 text-grey-6 q-mt-sm">
          Let's start with your basic information
        </div>
      </q-card-section>

      <q-card-section class="step-form">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            ref="nameRef"
            v-model="name"
            type="text"
            label="Full Name"
            outlined
            :rules="nameRules"
            lazy-rules
            class="step-input"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            ref="emailRef"
            v-model="email"
            type="email"
            label="Email Address"
            outlined
            :rules="emailRules"
            lazy-rules
            class="step-input"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            ref="passwordRef"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            :rules="passwordRules"
            lazy-rules
            class="step-input"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            ref="phoneRef"
            v-model="phone"
            type="tel"
            label="Phone Number"
            outlined
            :rules="phoneRules"
            lazy-rules
            class="step-input"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>

          <div class="step-actions q-mt-xl">
            <q-btn
              type="submit"
              :loading="loading"
              color="dark"
              size="lg"
              class="full-width step-btn"
              :disable="loading"
            >
              <span v-if="!loading">Continue to Next Step</span>
              <q-spinner-dots v-if="loading" />
            </q-btn>
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="step-footer">
        <div class="text-center text-body2 text-grey-6">
          Already have an account?
          <q-btn
            flat
            no-caps
            color="dark"
            class="q-pa-none text-weight-medium"
            @click="$router.push('/login')"
          >
            login in here
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
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-form {
  padding: 16px 32px 24px 32px;
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

.step-input :deep(.q-field__append .q-icon) {
  color: #757575;
  transition: color 0.3s ease;
}

.step-input :deep(.q-field__append .q-icon:hover) {
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

.step-footer {
  padding: 16px 32px 24px 32px;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #f0f0f0;
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

/* Success states */
.step-input :deep(.q-field--filled:not(.q-field--error) .q-field__control) {
  border-color: #4caf50;
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
}

/* Focus management */
.step-input :deep(.q-field__control) {
  outline: none;
}

.step-input :deep(.q-field__native) {
  color: #212121;
  font-weight: 500;
}

/* Placeholder styling */
.step-input :deep(.q-field__native::placeholder) {
  color: #9e9e9e;
  opacity: 1;
}
</style>
