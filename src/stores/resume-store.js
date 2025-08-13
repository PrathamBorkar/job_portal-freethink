import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useResumeStore = defineStore('resume', () => {
  const resumeUrl = ref(null)
  const isResumeCached = ref(false)

  const fetchResumeBlob = async (uid) => {
    try {
      const response = await fetch(`http://localhost:3000/resume/view-resume/${uid}`)
      if (!response.ok) throw new Error('Resume fetch failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (resumeUrl.value) {
        URL.revokeObjectURL(resumeUrl.value)
      }

      resumeUrl.value = url
      isResumeCached.value = true
    } catch (err) {
      console.error('Failed to fetch resume:', err)
      resumeUrl.value = null
      isResumeCached.value = false
    }
  }

  const clearResume = () => {
    if (resumeUrl.value) {
      URL.revokeObjectURL(resumeUrl.value)
    }
    resumeUrl.value = null
    isResumeCached.value = false
  }

  return {
    resumeUrl,
    isResumeCached,
    fetchResumeBlob,
    clearResume,
  }
})
