<template>
  <div class="logo-slider-section">
    <!-- Main Logo Slider -->
    <div ref="carousel" class="logo-slider-wrapper">
      <div ref="track" class="logo-slider-track">
        <div
          v-for="(company, index) in extendedCompanies"
          :key="`logo-${index}`"
          class="company-logo-item"
          @click="handleLogoClick(company)"
        >
          <div class="logo-container">
            <img
              v-if="company.logo"
              :src="company.logo"
              :alt="company.name"
              class="company-logo-img"
              @error="handleImageError"
            />
            <div v-else class="company-logo-fallback">
              {{ company.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <span class="company-name">{{ company.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import gsap from 'gsap'
import { useStore } from 'src/stores/company-store'

const carousel = ref(null)
const track = ref(null)

const store = useStore()

const emit = defineEmits(['logo-clicked'])

let logoAnimation = null

// Create extended companies list for smooth infinite scroll
const extendedCompanies = computed(() => {
  const companies = store.companies || []
  if (companies.length === 0) return []

  const repeatCount = Math.max(10, Math.ceil(20 / companies.length))
  return Array.from({ length: repeatCount }, () => companies).flat()
})

const createLogoAnimation = () => {
  if (!track.value || extendedCompanies.value.length === 0) return

  const trackEl = track.value
  const totalWidth = trackEl.scrollWidth / 2

  if (logoAnimation) {
    logoAnimation.kill()
  }

  logoAnimation = gsap.timeline({ repeat: -1 })

  logoAnimation.to(trackEl, {
    x: -totalWidth,
    duration: 45, // Speed factor of 0.7
    ease: 'none',
  })

  logoAnimation.set(trackEl, { x: 0 })
}

const handleLogoClick = (company) => {
  emit('logo-clicked', company)
}

const handleImageError = (event) => {
  // Hide the image and show fallback
  event.target.style.display = 'none'
  const fallback = event.target.nextElementSibling
  if (fallback) {
    fallback.style.display = 'flex'
  }
}

onMounted(() => {
  requestAnimationFrame(() => {
    createLogoAnimation()
  })
})

onUnmounted(() => {
  if (logoAnimation) {
    logoAnimation.kill()
  }
})
</script>

<style scoped>
.logo-slider-section {
  width: 100%;
  background: #000000;
  border-radius: 1rem;
  padding: 3rem 0;
  position: relative;
  overflow: hidden;
}

/* Main Logo Slider */
.logo-slider-wrapper {
  overflow: hidden;
  width: 100%;
  position: relative;
  -webkit-mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
  mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
}

.logo-slider-track {
  display: flex;
  gap: 3rem;
  will-change: transform;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  padding: 0 2rem;
}

.company-logo-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 1rem;
  border-radius: 0.75rem;
  white-space: nowrap;
}

.company-logo-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.logo-container {
  width: 60px;
  height: 60px;
  background: #ffffff;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
}

.company-logo-item:hover .logo-container {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

.company-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.company-logo-fallback {
  width: 100%;
  height: 100%;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
}

.company-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  transition: color 0.3s ease;
}

.company-logo-item:hover .company-name {
  color: #f3f4f6;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .logo-slider-section {
    padding: 2.5rem 0;
  }

  .logo-slider-track {
    gap: 2.5rem;
  }
}

@media (max-width: 768px) {
  .logo-slider-section {
    padding: 2rem 0;
    border-radius: 0.75rem;
  }

  .logo-slider-track {
    gap: 2rem;
    padding: 0 1rem;
  }

  .logo-container {
    width: 50px;
    height: 50px;
    padding: 0.5rem;
  }

  .company-name {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .logo-slider-section {
    padding: 1.5rem 0;
  }

  .logo-slider-track {
    gap: 1.5rem;
  }

  .logo-container {
    width: 40px;
    height: 40px;
    padding: 0.375rem;
  }

  .company-name {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .logo-slider-section {
    padding: 1rem 0;
  }

  .company-logo-item {
    gap: 0.5rem;
    padding: 0.5rem;
  }
}

/* Focus states for accessibility */
.company-logo-item:focus {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
  border-radius: 0.75rem;
}

/* Performance optimizations */
.logo-slider-track {
  backface-visibility: hidden;
  perspective: 1000px;
}

.company-logo-item {
  transform: translateZ(0);
}
</style>
