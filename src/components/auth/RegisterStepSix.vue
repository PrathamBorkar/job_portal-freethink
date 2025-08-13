<script setup>
import { ref, computed, onMounted, defineProps } from 'vue'
const baseUrl = import.meta.env.VITE_API_BASE_URL

const props = defineProps({
  StepSixUpdate: {
    type: Function,
    required: true,
  },
})

const skills = ref([])
const selectedSkillIds = ref([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)

const filteredSkills = computed(() => {
  if (!searchQuery.value) return []
  return skills.value.filter(
    ([id, name]) =>
      name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      !selectedSkillIds.value.includes(id),
  )
})

const selectedSkills = computed(() => {
  return selectedSkillIds.value.map((id) => {
    const found = skills.value.find(([sid]) => sid === id)
    return found || [id, 'Unknown Skill']
  })
})
async function getAllSkills() {
  try {
    console.log('Fetching skills from backend...')
    loading.value = true
    error.value = null

    const res = await fetch(`${baseUrl}/skills/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Response status:', res.status)

    if (!res.ok) {
      throw new Error('Failed to fetch skills')
    }

    const responseData = await res.json()
    console.log('Response data:', responseData)

    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to fetch skills')
    }

    return responseData.skills
  } catch (err) {
    error.value = err.message
    console.error('Error fetching skills:', err)
    return []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  skills.value = await getAllSkills()
})

function addSkill(id) {
  if (!selectedSkillIds.value.includes(id)) {
    selectedSkillIds.value = [...selectedSkillIds.value, id]
    searchQuery.value = ''
  }
}

function removeSkill(id) {
  selectedSkillIds.value = selectedSkillIds.value.filter((sid) => sid !== id)
}

function onSubmit() {
  if (selectedSkillIds.value.length === 0) {
    error.value = 'Please select at least one skill'
    return
  }

  props.StepSixUpdate(selectedSkillIds.value)
  error.value = null
}
</script>

<template>
  <div class="step-container">
    <q-card class="step-card">
      <q-card-section class="step-header">
        <div class="step-badge">Step 5 of 6</div>
        <div class="text-h4 text-weight-bold">Skills Selection</div>
        <div class="text-subtitle2 text-grey-6 q-mt-sm">
          Select your relevant skills and expertise
        </div>
      </q-card-section>

      <q-card-section class="step-form">
        <div class="skill-selection">
          <!-- Search and selection area -->
          <q-input
            v-model="searchQuery"
            type="text"
            label="Search for skills"
            outlined
            class="skill-input"
            :loading="loading"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Error message -->
          <div v-if="error" class="text-negative q-mb-md">
            <q-icon name="error" class="q-mr-xs" />
            {{ error }}
          </div>

          <!-- Skills dropdown -->
          <q-list v-if="searchQuery && filteredSkills.length" bordered class="dropdown">
            <q-item
              v-for="[id, name] in filteredSkills"
              :key="id"
              clickable
              @click="addSkill(id)"
              class="dropdown-item"
            >
              <q-item-section>
                <q-item-label>{{ name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="add" />
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Selected skills chips -->
          <div class="selected-chips q-mt-md">
            <q-chip
              v-for="[id, name] in selectedSkills"
              :key="id"
              removable
              @remove="removeSkill(id)"
              color="dark"
              text-color="white"
              class="skill-chip"
            >
              {{ name }}
            </q-chip>
          </div>

          <!-- Empty state -->
          <div v-if="selectedSkillIds.length === 0" class="empty-state text-grey-6 q-mt-md">
            <q-icon name="info" size="sm" class="q-mr-xs" />
            Start typing to search for skills
          </div>

          <!-- Next step button -->
          <div class="step-actions q-mt-xl">
            <q-btn
              color="dark"
              size="lg"
              class="full-width step-btn"
              @click="onSubmit"
              :disable="selectedSkillIds.length === 0"
            >
              Continue to Next Step
            </q-btn>
          </div>
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

.skill-selection {
  width: 100%;
}

.skill-input {
  margin-bottom: 16px;
}

.skill-input :deep(.q-field__control) {
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.skill-input :deep(.q-field__control):hover {
  border-color: #bdbdbd;
  background: #f5f5f5;
}

.skill-input :deep(.q-field--focused .q-field__control) {
  border-color: #212121;
  box-shadow: 0 0 0 2px rgba(33, 33, 33, 0.1);
  background: white;
}

.dropdown {
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
}

.dropdown-item {
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
  padding: 8px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px dashed #e0e0e0;
}

.skill-chip {
  transition: all 0.3s ease;
}

.skill-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px dashed #e0e0e0;
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
  background: #e0e0e0 !important;
  color: #bdbdbd !important;
  transform: none !important;
  box-shadow: none !important;
  pointer-events: none !important;
  cursor: not-allowed !important;
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
