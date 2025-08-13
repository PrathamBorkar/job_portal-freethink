<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()
const router = useRouter()
const $q = useQuasar()
const email = ref('')
const password = ref('')
const emailRef = ref(null)
const passwordRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const showError = ref(false)
const showSuccess = ref(false)

// Form validation rules
const emailRules = [
  (val) => !!val || 'Email is required',
  (val) => /.+@.+\..+/.test(val) || 'Please enter a valid email address',
]

const passwordRules = [
  (val) => !!val || 'Password is required',
  (val) => val.length >= 6 || 'Password must be at least 6 characters',
]

const onSubmit = async () => {
  emailRef.value.validate()
  passwordRef.value.validate()

  if (emailRef.value.hasError || passwordRef.value.hasError) {
    return
  }

  loading.value = true

  const payload = {
    email: email.value,
    password: password.value,
  }

  try {
    const result = await userStore.login(payload)

    if (result.success) {
      showSuccess.value = true
      showError.value = false

      // Show success toast
      $q.notify({
        type: 'positive',
        message: result.message || 'Login successful! Redirecting...',
        position: 'bottom-right',
        timeout: 2000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })

      // Small delay to show success message before redirect
      setTimeout(() => {
        const role = userStore?.role
        if (role === 'applicant') {
          router.push('/applicant')
        } else if (role === 'recruiter') {
          router.push('/recruiter')
        }
      }, 1000)
    } else {
      showError.value = true
      showSuccess.value = false

      // Show error toast
      $q.notify({
        type: 'negative',
        message: result.message || 'Login failed. Please check your credentials and try again.',
        position: 'bottom-right',
        timeout: 4000,
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })

      console.warn('Login failed:', result.message)
    }
  } catch (error) {
    showError.value = true
    showSuccess.value = false

    // Show error toast for network/unexpected errors
    $q.notify({
      type: 'negative',
      message: 'An unexpected error occurred. Please try again.',
      position: 'bottom-right',
      timeout: 4000,
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
    })

    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <q-card class="login-card">
      <q-card-section class="login-header">
        <div class="text-h4 text-weight-bold text-center">Login</div>
        <div class="text-subtitle2 text-grey-6 text-center q-mt-sm">
          Welcome back! Please log in to your account
        </div>
      </q-card-section>

      <q-card-section class="login-form">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            ref="emailRef"
            v-model="email"
            type="email"
            label="Email Address"
            outlined
            :rules="emailRules"
            lazy-rules
            class="login-input"
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
            class="login-input"
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

          <div class="q-mt-lg">
            <q-btn
              type="submit"
              :loading="loading"
              color="dark"
              size="lg"
              class="full-width login-btn"
              :disable="loading"
            >
              <span v-if="!loading">Log In</span>
              <q-spinner-dots v-if="loading" />
            </q-btn>
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <div class="text-body2 text-grey-6">
          Don't have an account?
          <q-btn
            flat
            no-caps
            color="dark"
            class="q-pa-none text-weight-medium"
            @click="router.push('/register')"
          >
            register here
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
    <div class="register-navigation">
      <q-btn flat no-caps color="dark" class="nav-btn" @click="router.push('/')">
        <q-icon name="arrow_back" class="q-mr-sm" />
        Back
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
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

@media (max-width: 768px) {
  .register-navigation {
    top: 16px;
    left: 16px;
  }
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.login-header {
  padding: 32px 32px 16px 32px;
  background: white;
  border-radius: 12px 12px 0 0;
}

.login-form {
  padding: 16px 32px 24px 32px;
  background: white;
}

.login-input {
  margin-bottom: 8px;
}

.login-input :deep(.q-field__control) {
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
}

.login-input :deep(.q-field__control):hover {
  border-color: #bdbdbd;
}

.login-input :deep(.q-field--focused .q-field__control) {
  border-color: #212121;
  box-shadow: 0 0 0 2px rgba(33, 33, 33, 0.1);
}

.login-input :deep(.q-field__label) {
  color: #616161;
  font-weight: 500;
}

.login-input :deep(.q-field--focused .q-field__label) {
  color: #212121;
}

.login-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  font-size: 16px;
  padding: 12px 0;
  background: #212121;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #424242;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 33, 33, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

/* Error states */
.login-input :deep(.q-field--error .q-field__control) {
  border-color: #f44336;
}

.login-input :deep(.q-field--error .q-field__label) {
  color: #f44336;
}

/* Password visibility toggle */
.login-input :deep(.q-field__append .q-icon) {
  color: #757575;
  transition: color 0.3s ease;
}

.login-input :deep(.q-field__append .q-icon:hover) {
  color: #212121;
}

/* Responsive design */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-header,
  .login-form {
    padding-left: 24px;
    padding-right: 24px;
  }
}
</style>
