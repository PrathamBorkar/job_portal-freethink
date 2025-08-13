<template>
  <q-card class="modern-profile-card full-width" flat bordered>
    <!-- Header with gradient -->
    <div class="card-header q-pa-md text-white relative-position">
      <div class="absolute-top-right q-pa-sm"></div>

      <div class="profile-header">
        <div class="profile-avatar-container">
          <q-avatar :size="avatarSize" class="profile-avatar">
            <img :src="user.profilePhoto" :alt="user.name" />
          </q-avatar>
          <q-badge :color="statusColor" rounded class="status-badge" />
        </div>

        <div class="profile-info">
          <div class="user-name text-weight-medium q-mb-xs">{{ user.name }}</div>
          <q-chip
            :color="planColor"
            :icon="planIcon"
            text-color="white"
            class="text-weight-medium plan-chip"
            :size="chipSize"
          >
            {{ user.plan.toUpperCase() }}
          </q-chip>
        </div>
      </div>
    </div>

    <!-- Contact Information -->
    <q-card-section class="contact-section">
      <div class="section-title text-weight-medium q-mb-md">Contact Information</div>

      <div class="contact-list">
        <!-- Email -->
        <div class="contact-item">
          <div class="contact-icon-wrapper">
            <q-icon name="email" :size="iconSize" color="grey-6" />
          </div>
          <div class="contact-details">
            <div class="contact-label text-weight-medium">Email</div>
            <div class="contact-value">{{ user.email }}</div>
          </div>
          <q-btn
            flat
            round
            icon="content_copy"
            size="sm"
            color="grey-6"
            @click="copyToClipboard(user.email, 'Email')"
            class="copy-btn"
          >
            <q-tooltip class="bg-grey-8">Copy</q-tooltip>
          </q-btn>
        </div>

        <!-- Phone -->
        <div class="contact-item">
          <div class="contact-icon-wrapper">
            <q-icon name="phone" :size="iconSize" color="grey-6" />
          </div>
          <div class="contact-details">
            <div class="contact-label text-weight-medium">Phone</div>
            <div class="contact-value">{{ user.phone }}</div>
          </div>
          <q-btn
            flat
            round
            icon="content_copy"
            size="sm"
            color="grey-6"
            @click="copyToClipboard(user.phone, 'Phone')"
            class="copy-btn"
          >
            <q-tooltip class="bg-grey-8">Copy</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <!-- Footer -->
    <q-separator />
    <q-card-section class="footer-section">
      <div class="status-row">
        <div class="status-info">
          <q-icon name="circle" :color="statusColor" size="10px" />
          <span class="status-text text-weight-medium">
            {{ user.status }}
          </span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'
import ApplicantPng from '../../assets/applicant.png'
import RecruiterPng from '../../assets/recruiter.png'

const $q = useQuasar()

const user = reactive({
  name: useUserStore().name,
  phone: useUserStore().phone,
  email: useUserStore().email,
  plan: 'Welcome',
  profilePhoto: useUserStore().role == 'applicant' ? ApplicantPng : RecruiterPng,
  status: useUserStore().role,
})

// Responsive sizing
const avatarSize = computed(() => {
  if ($q.screen.xs) return '60px'
  if ($q.screen.sm) return '70px'
  return '80px'
})

const iconSize = computed(() => {
  if ($q.screen.xs) return '18px'
  return '20px'
})

const chipSize = computed(() => {
  if ($q.screen.xs) return 'xs'
  return 'sm'
})

const planColor = computed(() => {
  return user.plan === 'premium' ? 'black' : 'grey-6'
})

const planIcon = computed(() => {
  return user.plan === 'premium' ? 'stars' : 'person'
})

const statusColor = computed(() => {
  return 'positive'
})

const copyToClipboard = (text, type) => {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      type: 'info',
      message: `${type} copied`,
      position: 'bottom',
      timeout: 1500,
    })
  })
}
</script>

<style scoped>
.modern-profile-card {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease;
  min-height: fit-content;
}

.modern-profile-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  position: relative;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.profile-avatar-container {
  position: relative;
  display: flex;
  justify-content: center;
}

.profile-avatar {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.status-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px !important;
  height: 14px !important;
  border: 2px solid white;
}

.profile-info {
  width: 100%;
}

.user-name {
  font-size: clamp(1rem, 4vw, 1.25rem);
  line-height: 1.2;
  word-break: break-word;
}

.plan-chip {
  font-size: 0.75rem;
}

.contact-section {
  padding: 16px;
}

.section-title {
  font-size: 0.875rem;
  color: #6b7280;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  gap: 12px;
}

.contact-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.08);
}

.contact-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-details {
  flex: 1;
  min-width: 0;
}

.contact-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 2px;
}

.contact-value {
  font-size: 0.875rem;
  color: #1f2937;
  word-break: break-all;
  line-height: 1.3;
}

.copy-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.contact-item:hover .copy-btn {
  opacity: 1;
}

.edit-btn {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.1);
}

.edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.footer-section {
  padding: 8px 16px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-text {
  font-size: 0.75rem;
}

.last-active {
  font-size: 0.75rem;
}

/* Mobile specific adjustments */
@media (max-width: 599px) {
  .profile-header {
    gap: 8px;
  }

  .contact-section {
    padding: 12px;
  }

  .contact-item {
    padding: 10px;
    gap: 10px;
  }

  .contact-value {
    font-size: 0.8rem;
  }
}

/* Small desktop adjustments for narrow column */
@media (min-width: 768px) and (max-width: 1023px) {
  .contact-value {
    font-size: 0.8rem;
  }

  .user-name {
    font-size: 1.1rem;
  }
}
</style>
