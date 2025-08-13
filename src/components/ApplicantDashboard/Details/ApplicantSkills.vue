<template>
  <q-card class="skills-card">
    <!-- Header -->
    <div class="form-header">
      <div>Add Your Skills</div>
      <div>
        <q-btn
          v-if="!isEditable"
          dense
          flat
          round
          icon="edit"
          size="sm"
          color="black"
          @click="toggleEdit"
        />
        <template v-else>
          <q-btn
            dense
            flat
            round
            icon="check"
            color="green"
            size="sm"
            class="q-mr-xs"
            @click="saveSkills"
          />
          <q-btn dense flat round icon="close" color="red" size="sm" @click="cancelEdit" />
        </template>
      </div>
    </div>

    <!-- Skills List -->
    <div class="skills-list">
      <q-chip
        v-for="(skill, index) in localSkills"
        :key="skill.id ?? skill.name"
        :style="chipStyle"
        class="skill-chip q-mr-sm q-mb-sm"
        :removable="isEditable"
        @remove="removeSkill(index)"
      >
        {{ skill.name }}
      </q-chip>
    </div>

    <!-- Search-based Skill Input -->
    <div v-if="isEditable" class="add-skill-row">
      <q-input
        v-model="searchQuery"
        dense
        outlined
        label="Search and add a skill"
        :loading="loadingSkills"
        color="white"
        class="add-skill-input q-mb-sm"
        clearable
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- Error Message -->
      <div v-if="skillFetchError" class="text-negative q-mb-sm">
        <q-icon name="error" class="q-mr-xs" />
        {{ skillFetchError }}
      </div>

      <!-- Skills Dropdown -->
      <q-list v-if="searchQuery && filteredSkills.length" bordered class="dropdown-skill-list">
        <q-item
          v-for="[id, name] in filteredSkills"
          :key="id"
          clickable
          @click="selectSkill([id, name])"
        >
          <q-item-section>{{ name }}</q-item-section>
          <q-item-section side>
            <q-icon name="add" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()

const isEditable = ref(false)
const localSkills = ref([])
const searchQuery = ref('')
const allSkills = ref([])
const loadingSkills = ref(false)
const skillFetchError = ref(null)

const chipStyle = computed(() => ({
  backgroundColor: '#1f2937',
  color: '#ffffff',
  transition: 'all 0.2s ease',
}))

onMounted(() => {
  const rawSkills = userStore.skills || []
  localSkills.value = rawSkills.map(([id, name]) => ({ id, name }))
  fetchAllSkills()
})

const toggleEdit = () => {
  isEditable.value = true
}

const saveSkills = () => {
  const updatedSkills = localSkills.value.map(({ id, name }) => [id, name])
  userStore.updateSkills(updatedSkills)
  isEditable.value = false
}

const cancelEdit = () => {
  const rawSkills = userStore.skills || []
  localSkills.value = rawSkills.map(([id, name]) => ({ id, name }))
  isEditable.value = false
}

const removeSkill = (index) => {
  localSkills.value.splice(index, 1)
}

const fetchAllSkills = async () => {
  try {
    loadingSkills.value = true
    skillFetchError.value = null
    const res = await fetch('http://localhost:3000/skills/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch skills')
    }

    allSkills.value = json.skills // [[id, name]]
  } catch (err) {
    skillFetchError.value = err.message
    console.error('Error fetching skills:', err)
  } finally {
    loadingSkills.value = false
  }
}

const filteredSkills = computed(() => {
  if (!searchQuery.value) return []
  return allSkills.value.filter(([id, name]) => {
    return (
      name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      !localSkills.value.some((skill) => skill.id === id)
    )
  })
})

const selectSkill = ([id, name]) => {
  localSkills.value.push({ id, name })
  searchQuery.value = ''
}
</script>

<style scoped>
.skills-card {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  background-color: #000000;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: white;
}

.form-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 18px;
  color: black;
  margin-bottom: 16px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
}

.skill-chip:hover {
  background-color: #374151;
  cursor: pointer;
}

.add-skill-row {
  margin-top: 12px;
  max-width: 300px;
}

.dropdown-skill-list {
  max-height: 200px;
  overflow-y: auto;
  background: #1f2937;
  color: white;
  border-radius: 8px;
  border: 1px solid #2e2e2e;
  margin-top: 4px;
}

.dropdown-skill-list .q-item:hover {
  background-color: #374151;
}
</style>
