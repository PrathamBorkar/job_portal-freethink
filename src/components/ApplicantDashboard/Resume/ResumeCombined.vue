<!-- ResumeCombined.vue -->
<template>
  <div class="bottom-section">
    <!-- LEFT SIDE -->
    <div class="left-side">
      <ResumeUploader class="widget" @uploaded="triggerReload" />
    </div>

    <!-- RIGHT SIDE -->
    <div class="right-side">
      <ResumePreview class="widget" :reload="reloadKey" />
    </div>
  </div>
</template>

<script setup>
import ResumeUploader from './ResumeUploader.vue'
import ResumePreview from './ResumePreview.vue'
import { ref } from 'vue'

const reloadKey = ref(0)

function triggerReload() {
  reloadKey.value += 1
}
</script>

<style scoped>
.bottom-section {
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
  gap: 16px;
  flex-wrap: nowrap;
  height: 100%;
  padding: 8px;
}

.left-side,
.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.widget {
  flex: 1;
  background: #ffffff;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  transition: border-color 0.2s ease;
}

.widget:hover {
  border-color: #d1d5db;
}

@media (max-width: 900px) {
  .bottom-section {
    flex-direction: column;
    gap: 12px;
  }

  .left-side .widget {
    max-height: 50vh;
  }
}
</style>
