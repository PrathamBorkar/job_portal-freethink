<template>
  <q-card class="education-info-form">
    <!-- Header -->
    <div class="form-header">
      <div>Education</div>
      <div v-if="!isEditable">
        <q-btn dense flat round icon="edit" size="sm" @click="toggleEdit" />
      </div>
      <div v-else class="row no-wrap items-center">
        <q-btn dense flat round icon="check" size="sm" color="positive" @click="saveEdit" />
        <q-btn dense flat round icon="close" size="sm" color="negative" @click="cancelEdit" />
      </div>
    </div>

    <!-- College Name -->
    <div class="edu-entry">
      <div class="edu-left">
        <div class="edu-title">
          <q-input
            v-model="tempData.institution"
            :disable="!isEditable"
            dense
            flat
            filled
            class="no-border"
            label="Institution Name"
          />
        </div>
      </div>
    </div>

    <!-- Degree -->
    <div class="edu-entry">
      <div class="edu-left">
        <div class="edu-title">
          <q-input
            v-model="tempData.degree"
            :disable="!isEditable"
            dense
            flat
            filled
            class="no-border"
            label="Degree"
          />
        </div>
        <q-input
          v-model="tempData.grade_value"
          :disable="!isEditable"
          dense
          flat
          filled
          class="no-border"
          :label="tempData.grade_type"
        >
          <template v-slot:append>
            <q-chip
              dense
              square
              color="grey-3"
              text-color="black"
              class="q-ml-sm"
              style="font-size: 13px"
            >
              {{ tempData.grade_type }}
            </q-chip>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Higher Secondary -->
    <div class="edu-entry">
      <div class="edu-left">
        <div class="edu-title">
          <q-input
            v-model="tempData.field_of_study"
            :disable="!isEditable"
            dense
            flat
            filled
            class="no-border"
            label="Field of study"
          />
        </div>
      </div>
    </div>

    <!-- High School -->
    <div class="edu-entry">
      <div class="edu-left">
        <div class="edu-title">
          <q-select
            v-model="tempData.education_level"
            :disable="!isEditable"
            dense
            flat
            filled
            :options="['Undergraduate', 'Postgraduate', 'Diploma', '10th', '12th', 'Phd']"
            class="no-border"
            label="Education level"
          />
        </div>
      </div>
    </div>

    <div class="edu-entry">
      <div class="edu-left">
        <div class="edu-title">
          <q-input
            v-model="tempData.start_date_degree"
            :disable="!isEditable"
            dense
            flat
            filled
            class="no-border"
            label="Start Date"
          />
        </div>
      </div>
    </div>

    <div class="edu-entry">
      <div class="edu-left">
        <div class="edu-title">
          <q-input
            v-model="tempData.end_date_degree"
            :disable="!isEditable"
            dense
            flat
            filled
            class="no-border"
            label="End date"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()

const isEditable = ref(false)

const tempData = reactive({
  degree: userStore.degree || '',
  institution: userStore.institution || '',
  field_of_study: userStore.field_of_study || '',
  start_date_degree: userStore.start_date_degree || '',
  end_date_degree: userStore.end_date_degree || '',
  grade_value: userStore.grade_value || '',
  grade_type: userStore.grade_type || '',
  education_level: userStore.education_level || '',
})

const toggleEdit = () => {
  isEditable.value = true
}

const saveEdit = () => {
  userStore.updateEducation({ ...tempData })
  isEditable.value = false
}

const cancelEdit = () => {
  tempData.degree = userStore.degree || ''
  tempData.institution = userStore.institution || ''
  tempData.field_of_study = userStore.field_of_study || ''
  tempData.start_date_degree = userStore.start_date_degree || ''
  tempData.end_date_degree = userStore.end_date_degree || ''
  tempData.grade_value = userStore.grade_value || ''
  tempData.grade_type = userStore.grade_type || ''
  tempData.education_level = userStore.education_level || ''

  isEditable.value = false
}
</script>

<style scoped>
.education-info-form {
  width: 100%;
  padding: 24px;
  background-color: white;
  border-radius: 16px;
  box-shadow:
    0 4px 8px rgba(255, 255, 255, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 3px rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  transition: box-shadow 0.3s ease;
}

.form-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 18px;
  color: #333;
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
  width: 100%;
}

.edu-title input,
.edu-subtitle input {
  font-size: 15px;
  font-weight: 500;
  color: #222;
  padding: 0;
  margin: 0;
}

.edu-subtitle input {
  font-size: 13px;
  color: #666;
}

.cert-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cert-header {
  font-weight: bold;
  font-size: 16px;
  color: #444;
  margin-bottom: 4px;
}

.cert-entry {
  width: 100%;
}

.no-border ::v-deep .q-field__control {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
</style>
