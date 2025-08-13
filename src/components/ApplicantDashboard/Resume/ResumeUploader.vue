<template>
  <div class="resume-uploader">
    <input ref="fileInput" type="file" accept="application/pdf" @change="handleFileChange" hidden />

    <!-- Upload Area -->
    <div
      class="upload-area"
      :class="{ 'has-file': resumeFile, dragging: isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div v-if="!resumeFile" class="upload-prompt">
        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <div class="upload-text">
          <div class="primary-text">Click or drag PDF here</div>
          <div class="secondary-text">Max 10MB</div>
        </div>
      </div>

      <div v-else class="file-display">
        <div class="file-info">
          <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
          <div class="file-details">
            <div class="file-name">{{ resumeName }}</div>
            <div class="file-size">{{ formatFileSize(resumeFile.size) }}</div>
          </div>
        </div>
        <button class="remove-btn" @click.stop="clearFile" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Upload Button -->
    <button
      class="upload-btn"
      :class="{ disabled: !resumeFile, loading: uploading }"
      :disabled="!resumeFile || uploading"
      @click="uploadResume"
      type="button"
    >
      <svg
        v-if="uploading"
        class="loading-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      <svg v-else class="upload-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {{ uploading ? 'Uploading...' : 'Upload Resume' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'
import { useResumeStore } from 'src/stores/resume-store'

const $q = useQuasar()
const uid = useUserStore().uid
const resumeStore = useResumeStore()

const fileInput = ref(null)
const resumeFile = ref(null)
const resumeName = ref(null)
const uploading = ref(false)
const isDragging = ref(false)

const emit = defineEmits(['uploaded'])

const triggerFileInput = () => fileInput.value.click()

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  processFile(file)
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  processFile(file)
}

const processFile = (file) => {
  if (file && file.type === 'application/pdf') {
    if (file.size > 10 * 1024 * 1024) {
      $q.notify({
        type: 'negative',
        message: 'File must be under 10MB',
        position: 'top',
      })
      return
    }
    resumeFile.value = file
    resumeName.value = file.name
  } else {
    $q.notify({
      type: 'negative',
      message: 'PDF files only',
      position: 'top',
    })
  }
}

const clearFile = () => {
  resumeFile.value = null
  resumeName.value = null
  if (fileInput.value) fileInput.value.value = null
}

const uploadResume = async () => {
  if (!resumeFile.value) return

  uploading.value = true
  const formData = new FormData()
  formData.append('uid', uid)
  formData.append('resume', resumeFile.value)

  try {
    const response = await fetch(`http://localhost:3000/resume/upload-resume/${uid}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Upload failed')

    $q.notify({
      type: 'positive',
      message: 'Resume uploaded successfully!',
      position: 'top',
    })

    await resumeStore.fetchResumeBlob(uid)
    emit('uploaded')
    clearFile()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Upload failed. Try again.',
      position: 'top',
    })
    console.error(err)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.resume-uploader {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  background: #ffffff;
}

.upload-area {
  flex: 1;
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.upload-area:hover {
  border-color: #9ca3af;
  background: #f5f5f5;
}

.upload-area.dragging {
  border-color: #374151;
  background: #f0f0f0;
  border-style: solid;
}

.upload-area.has-file {
  border-style: solid;
  border-color: #d1d5db;
  background: #ffffff;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  color: #6b7280;
}

.upload-icon {
  width: 40px;
  height: 40px;
  stroke-width: 1.5;
}

.primary-text {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.secondary-text {
  font-size: 14px;
  color: #9ca3af;
}

.file-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 32px;
  height: 32px;
  color: #374151;
  stroke-width: 1.5;
}

.file-name {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
}

.remove-btn {
  padding: 8px;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #dc2626;
  background: #fef2f2;
}

.remove-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: #111827;
  color: #ffffff;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover:not(.disabled):not(.loading) {
  background: #000000;
}

.upload-btn.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.upload-btn.loading {
  cursor: not-allowed;
}

.upload-btn-icon,
.loading-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
