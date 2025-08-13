<template>
  <q-card flat bordered class="company-profile-card">
    <div class="card-header">
      <div class="card-title">Company Profile</div>
      <div class="action-buttons">
        <q-btn dense flat round icon="edit" v-if="!isEditable" @click="enableEdit" color="black" />
        <q-btn dense flat round icon="check" v-if="isEditable" @click="save" color="positive" />
        <q-btn
          dense
          flat
          round
          icon="close"
          v-if="isEditable"
          @click="cancelEdit"
          color="negative"
        />
      </div>
    </div>

    <q-separator class="custom-separator" />

    <q-form class="form-content">
      <q-input
        v-model="editData.name"
        :disable="!isEditable"
        filled
        label="Company Name"
        class="styled-input"
      />
      <q-input
        v-model="editData.description"
        :disable="!isEditable"
        filled
        type="textarea"
        label="Description"
        class="styled-input"
      />
      <q-select
        v-model="editData.companySize"
        :disable="!isEditable"
        filled
        label="Company Size"
        :options="sizeOptions"
        class="styled-input"
      />
      <q-select
        v-model="editData.status"
        :disable="!isEditable"
        filled
        label="Status"
        :options="statusOptions"
        class="styled-input"
      />
      <q-input
        v-model="editData.CEO"
        :disable="!isEditable"
        filled
        label="CEO"
        class="styled-input"
      />
      <q-input
        v-model="editData.companyEmail"
        :disable="!isEditable"
        filled
        label="Company Email"
        class="styled-input"
      />

      <q-input
        v-model="editData.location"
        :disable="!isEditable"
        filled
        label="Location"
        class="styled-input"
      />

      <!-- Tags -->
      <div class="section-header">
        <div class="section-title">Tags</div>
        <q-btn v-if="isEditable" flat dense round icon="add" class="add-btn" @click="addTag" />
      </div>
      <div v-for="(tag, index) in editData.tags" :key="'tag-' + index" class="dynamic-item">
        <q-input
          v-model="editData.tags[index]"
          :disable="!isEditable"
          filled
          class="styled-input dynamic-input"
        />
        <q-btn
          v-if="isEditable"
          flat
          dense
          round
          icon="remove"
          class="remove-btn"
          @click="removeTag(index)"
        />
      </div>

      <!-- Links -->
      <div class="section-header">
        <div class="section-title">Links</div>
        <q-btn v-if="isEditable" flat dense round icon="add" class="add-btn" @click="addLink" />
      </div>
      <div v-for="(link, index) in editData.links" :key="'link-' + index" class="dynamic-item">
        <q-input
          v-model="editData.links[index]"
          :disable="!isEditable"
          filled
          class="styled-input dynamic-input"
        />
        <q-btn
          v-if="isEditable"
          flat
          dense
          round
          icon="remove"
          class="remove-btn"
          @click="removeLink(index)"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'

const $q = useQuasar()
const isEditable = ref(false)

const editData = reactive(JSON.parse(JSON.stringify(useUserStore().company)))

const sizeOptions = ['1-10', '11-50', '51-200', '201-500', '500+']
const statusOptions = ['Hiring', 'Not-Hiring']

onMounted(() => {
  console.log('Reactive Edit Data:', editData)
})

function enableEdit() {
  isEditable.value = true
}

function addTag() {
  if (!Array.isArray(editData.tags)) {
    editData.tags = []
  }
  editData.tags.push('')
}

function addLink() {
  if (!Array.isArray(editData.links)) {
    editData.links = []
  }
  editData.links.push('')
}

function removeTag(index) {
  if (Array.isArray(editData.tags)) {
    editData.tags.splice(index, 1)
  }
}

function removeLink(index) {
  if (Array.isArray(editData.links)) {
    editData.links.splice(index, 1)
  }
}

function cancelEdit() {
  Object.assign(editData, JSON.parse(JSON.stringify(useUserStore().company)))
  isEditable.value = false
}

async function save() {
  isEditable.value = false
  try {
    const response = await useUserStore().updateRecruiter(editData)

    if (response.message == 'success') {
      $q.notify({ type: 'positive', message: 'Company updated.' })
    } else {
      $q.notify({ type: 'negative', message: 'Company updated failed.' })
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Failed to save changes.', error: err })
  }
}
</script>

<style scoped>
.company-profile-card {
  background: white !important;
  border: 1px solid #e5e5e5 !important;
  border-radius: 0.375rem !important;
  padding: 1.5rem !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  height: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-btn {
  background: #f5f5f5 !important;
  color: #000000 !important;
  border-radius: 0.375rem !important;
}

.edit-btn:hover {
  background: #e5e5e5 !important;
}

.save-btn {
  background: #10b981 !important;
  color: white !important;
  border-radius: 0.375rem !important;
}

.save-btn:hover {
  background: #059669 !important;
}

.cancel-btn {
  background: #ef4444 !important;
  color: white !important;
  border-radius: 0.375rem !important;
}

.cancel-btn:hover {
  background: #dc2626 !important;
}

.custom-separator {
  background-color: #e5e5e5 !important;
  margin: 1rem 0 !important;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.styled-input {
  background: white;
}

.styled-input :deep(.q-field__control) {
  background: white !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  color: #000000 !important;
}

.styled-input :deep(.q-field__control):before {
  border: none !important;
}

.styled-input :deep(.q-field__control):after {
  border: 2px solid #000000 !important;
  border-radius: 0.375rem !important;
}

.styled-input :deep(.q-field__label) {
  color: #374151 !important;
  font-weight: 500 !important;
}

.styled-input :deep(.q-field__native) {
  color: #000000 !important;
}

.styled-input :deep(.q-field--disabled) {
  opacity: 0.7 !important;
}

.styled-input :deep(.q-field--disabled .q-field__control) {
  background: #f9fafb !important;
  color: #6b7280 !important;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
}

.add-btn {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #000000 !important;
  border-radius: 0.375rem !important;
}

.add-btn:hover {
  background: #f9fafb !important;
  border-color: #000000 !important;
}

.dynamic-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dynamic-input {
  flex: 1;
}

.remove-btn {
  background: white !important;
  border: 1px solid #ef4444 !important;
  color: #ef4444 !important;
  border-radius: 0.375rem !important;
}

.remove-btn:hover {
  background: #ef4444 !important;
  color: white !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .company-profile-card {
    padding: 1rem !important;
    max-height: 80vh;
  }

  .card-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .action-buttons {
    align-self: flex-end;
  }

  .dynamic-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .remove-btn {
    align-self: flex-end;
    width: 40px;
  }
}

@media (max-width: 480px) {
  .company-profile-card {
    padding: 0.75rem !important;
    border-radius: 0.25rem !important;
  }

  .section-header {
    margin-top: 1rem;
  }
}
</style>
