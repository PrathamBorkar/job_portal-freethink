<template>
  <q-card class="education-info-form">
    <!-- Header -->
    <div class="form-header">
      <div>Additional Details</div>
      <div v-if="!isEditable">
        <q-btn dense flat round icon="edit" size="sm" @click="toggleEdit" />
      </div>
      <div v-else class="row no-wrap items-center">
        <q-btn dense flat round icon="check" size="sm" color="positive" @click="saveEdit" />
        <q-btn dense flat round icon="close" size="sm" color="negative" @click="cancelEdit" />
      </div>
    </div>

    <!-- PERSONAL INFO -->
    <div class="section-title">Personal Information</div>
    <div class="edu-entry">
      <div class="edu-left">
        <q-select
          v-model="tempData.gender"
          :disable="!isEditable"
          :options="['Male', 'Female', 'Other']"
          dense
          flat
          filled
          class="no-border"
          label="Gender"
        />
        <q-input
          v-model="tempData.dob"
          :disable="!isEditable"
          dense
          flat
          filled
          class="no-border"
          label="Date of Birth"
          type="date"
        />
      </div>
    </div>

    <!-- PROFESSIONAL INFO -->
    <div class="section-title">Professional Details</div>
    <div class="edu-entry">
      <div class="edu-left">
        <q-select
          v-model="tempData.employmentStatus"
          :disable="!isEditable"
          :options="['Employed', 'Unemployed', 'Fresher']"
          dense
          flat
          filled
          class="no-border"
          label="Employment Status"
        />
      </div>
    </div>

    <!-- JOB PREFERENCES -->
    <div class="section-title">Job Preferences</div>
    <div class="edu-entry">
      <div class="edu-left">
        <q-select
          v-model="tempData.jobType"
          :disable="!isEditable"
          :options="['Full-time', 'Part-time', 'Internship']"
          dense
          flat
          filled
          class="no-border"
          label="Preferred Job Type"
        />
        <q-select
          v-model="tempData.availability"
          :disable="!isEditable"
          :options="['Remote', 'Onsite', 'Hybrid']"
          dense
          flat
          filled
          class="no-border"
          label="Availability"
        />
      </div>
    </div>

    <!-- AVAILABILITY -->
    <div class="edu-entry">
      <div class="edu-left">
        <q-select
          v-model="tempData.jobType"
          :disable="!isEditable"
          :options="['Full-time', 'Part-time', 'Internship']"
          dense
          flat
          filled
          class="no-border"
          label="Preferred Job Type"
        />
      </div>
    </div>

    <!-- LINKS -->
    <div class="section-title">Links</div>
    <div class="edu-entry">
      <div class="edu-left">
        <q-input
          v-model="tempData.linkedIn"
          :disable="!isEditable"
          dense
          flat
          filled
          class="no-border"
          label="LinkedIn Profile URL"
        />
        <q-input
          v-model="tempData.portfolioWebsite"
          :disable="!isEditable"
          dense
          flat
          filled
          class="no-border"
          label="Portfolio Website (if any)"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { useUserStore } from 'src/stores/user-store'
import { ref, reactive } from 'vue'

const userStore = useUserStore()

const isEditable = ref(false)

const tempData = reactive({
  gender: userStore.gender || '',
  dob: userStore.dob,
  employmentStatus: userStore.employmentStatus || '',
  jobType: userStore.jobType || '',
  preferredLocation: userStore.preferredLocation || '',
  availability: userStore.availability || '',
  linkedIn: userStore.linkedIn || '',
  portfolioWebsite: userStore.portfolioWebsite || '',
})

const toggleEdit = () => {
  isEditable.value = true
}

const saveEdit = () => {
  userStore.updateAdditionalData({ ...tempData })
  isEditable.value = false
}

const cancelEdit = () => {
  tempData.gender = userStore.gender || ''
  tempData.dob = userStore.dob || ''
  tempData.employmentStatus = userStore.employmentStatus || ''
  tempData.jobType = userStore.jobType || ''
  tempData.preferredLocation = userStore.preferredLocation || ''
  tempData.availability = userStore.availability || ''
  tempData.linkedIn = userStore.linkedIn || ''
  tempData.portfolioWebsite = userStore.portfolioWebsite || ''
  isEditable.value = false
}
</script>

<style scoped>
.education-info-form {
  width: 100%;
  padding: 24px;
  background-color: white;
  border-radius: 16px;

  /* 💡 3D Effect + white glow */
  box-shadow:
    0 4px 8px rgba(255, 255, 255, 0.4),
    /* soft white outer glow */ 0 8px 16px rgba(0, 0, 0, 0.05),
    /* subtle shadow for depth */ inset 0 1px 3px rgba(255, 255, 255, 0.6); /* slight inset highlight */

  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  transition: box-shadow 0.3s ease;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #444;
  margin-top: 12px;
}

.edu-entry {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.edu-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.no-border ::v-deep .q-field__control {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important; /* ✅ Remove grey background */
  border-radius: 0 !important;
  padding: 0 !important;
  font-size: 14px;
}
</style>
