<template>
  <div class="carousel-section">
    <div ref="carousel" class="carousel-wrapper">
      <!-- Gradient overlays for smooth edges -->
      <div class="gradient-overlay gradient-left"></div>
      <div class="gradient-overlay gradient-right"></div>

      <div
        ref="track"
        class="carousel-track"
        @mouseenter="pauseAnimation"
        @mouseleave="resumeAnimation"
      >
        <div
          class="company-slide"
          v-for="(company, index) in repeatedCompanies"
          :key="`company-${index}`"
        >
          <CompanyCard :company="company" @view-jobs="handleViewJobs" />
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="carousel-controls">
      <button class="control-btn pause-btn" @click="toggleAnimation" :class="{ active: isPaused }">
        <svg v-if="!isPaused" class="control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
        <svg v-else class="control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span class="control-label">{{ isPaused ? 'Play' : 'Pause' }}</span>
      </button>

      <div class="speed-controls">
        <button
          class="control-btn speed-btn"
          @click="changeSpeed(0.5)"
          :class="{ active: currentSpeed === 0.5 }"
        >
          0.5x
        </button>
        <button
          class="control-btn speed-btn"
          @click="changeSpeed(1)"
          :class="{ active: currentSpeed === 1 }"
        >
          1x
        </button>
        <button
          class="control-btn speed-btn"
          @click="changeSpeed(2)"
          :class="{ active: currentSpeed === 2 }"
        >
          2x
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import gsap from 'gsap'
import CompanyCard from './CompanyCard.vue'
import { useStore } from 'src/stores/company-store'

const carousel = ref(null)
const track = ref(null)
const isPaused = ref(false)
const currentSpeed = ref(0.7)

const store = useStore()

let animation = null
let isHovering = false

const emit = defineEmits(['company-selected'])

// Create enough repeated companies for smooth infinite scroll
const repeatedCompanies = computed(() => {
  const companies = store.companies || []
  if (companies.length === 0) return []

  const repeatCount = Math.max(12, Math.ceil(24 / companies.length))
  return Array.from({ length: repeatCount }, () => companies).flat()
})

const createAnimation = () => {
  if (!track.value || repeatedCompanies.value.length === 0) return

  const trackEl = track.value
  const totalWidth = trackEl.scrollWidth / 2

  if (animation) {
    animation.kill()
  }

  animation = gsap.timeline({ repeat: -1, paused: isPaused.value })

  animation.to(trackEl, {
    x: -totalWidth,
    duration: 60 / currentSpeed.value,
    ease: 'none',
  })

  animation.set(trackEl, { x: 0 })
}

const pauseAnimation = () => {
  isHovering = true
  if (animation && !isPaused.value) {
    animation.pause()
  }
}

const resumeAnimation = () => {
  isHovering = false
  if (animation && !isPaused.value) {
    animation.resume()
  }
}

const toggleAnimation = () => {
  isPaused.value = !isPaused.value

  if (animation) {
    if (isPaused.value || isHovering) {
      animation.pause()
    } else {
      animation.resume()
    }
  }
}

const changeSpeed = (speed) => {
  currentSpeed.value = speed
  createAnimation()
}

const handleViewJobs = (company) => {
  emit('company-selected', company)
}

onMounted(() => {
  // Wait for next tick to ensure DOM is ready
  requestAnimationFrame(() => {
    createAnimation()
  })
})

onUnmounted(() => {
  if (animation) {
    animation.kill()
  }
})
</script>

<style scoped>
.carousel-section {
  width: 100%;
  position: relative;
}

.carousel-wrapper {
  overflow: hidden;
  width: 100%;
  position: relative;
  padding: 2rem 0;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120px;
  z-index: 10;
  pointer-events: none;
}

.gradient-left {
  left: 0;
  background: linear-gradient(to right, #f9fafb, transparent);
}

.gradient-right {
  right: 0;
  background: linear-gradient(to left, #f9fafb, transparent);
}

.carousel-track {
  display: flex;
  gap: 2rem;
  will-change: transform;
  justify-content: flex-start;
  flex-wrap: nowrap;
  padding: 0 2rem;
}

.company-slide {
  flex: 0 0 300px;
  min-width: 300px;
  white-space: normal;
}

.carousel-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  border-color: #000000;
  color: #000000;
  transform: translateY(-1px);
}

.control-btn.active {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}

.control-icon {
  width: 16px;
  height: 16px;
}

.control-label {
  font-size: 0.875rem;
}

.speed-controls {
  display: flex;
  gap: 0.5rem;
}

.speed-btn {
  min-width: 50px;
  justify-content: center;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .company-slide {
    flex: 0 0 280px;
    min-width: 280px;
  }

  .carousel-track {
    gap: 1.5rem;
  }
}

@media (max-width: 992px) {
  .company-slide {
    flex: 0 0 260px;
    min-width: 260px;
  }

  .carousel-track {
    gap: 1rem;
    padding: 0 1.5rem;
  }

  .gradient-overlay {
    width: 80px;
  }
}

@media (max-width: 768px) {
  .company-slide {
    flex: 0 0 240px;
    min-width: 240px;
  }

  .carousel-wrapper {
    padding: 1.5rem 0;
  }

  .carousel-track {
    padding: 0 1rem;
  }

  .carousel-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .speed-controls {
    order: -1;
  }

  .gradient-overlay {
    width: 60px;
  }
}

@media (max-width: 640px) {
  .company-slide {
    flex: 0 0 220px;
    min-width: 220px;
  }

  .carousel-track {
    gap: 0.75rem;
  }

  .control-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .control-label {
    display: none;
  }

  .speed-btn {
    min-width: 40px;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .company-slide {
    flex: 0 0 200px;
    min-width: 200px;
  }

  .carousel-wrapper {
    margin-bottom: 1rem;
  }

  .carousel-controls {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .gradient-overlay {
    width: 40px;
  }
}

/* Focus states for accessibility */
.control-btn:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

/* Animation performance optimizations */
.carousel-track {
  backface-visibility: hidden;
  perspective: 1000px;
}

.company-slide {
  transform: translateZ(0);
}
</style>
