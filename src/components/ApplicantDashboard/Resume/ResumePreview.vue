<template>
  <div class="resume-preview">
    <div v-if="resumeStore.isResumeCached && resumeStore.resumeUrl" class="preview-container">
      <iframe
        :src="resumeStore.resumeUrl"
        width="100%"
        height="100%"
        class="resume-iframe"
      ></iframe>
    </div>

    <div v-else class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
      <span class="empty-text">Drop a resume to preview</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useUserStore } from 'src/stores/user-store'
import { useResumeStore } from 'src/stores/resume-store'

const { uid } = useUserStore()
const resumeStore = useResumeStore()

const props = defineProps({
  reload: Number,
})

onMounted(() => {
  if (!resumeStore.isResumeCached) {
    resumeStore.fetchResumeBlob(uid)
  }
})

watch(
  () => props.reload,
  () => {
    resumeStore.fetchResumeBlob(uid)
  },
)
</script>

<style scoped>
.resume-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.preview-container {
  flex: 1;
  padding: 12px;
  background: #fafafa;
}

.resume-iframe {
  border: none;
  border-radius: 0.25rem;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9ca3af;
}

.empty-icon {
  width: 48px;
  height: 48px;
  stroke-width: 1.5;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
}
</style>
