<template>
  <div class="separator-container">
    <!-- Animated Line Separator -->
    <div class="separator-line-wrapper">
      <div class="separator-line" :class="{ animate: isVisible }"></div>
      <div class="separator-glow" :class="{ animate: isVisible }"></div>
    </div>

    <!-- Center Ornament -->
    <div class="separator-ornament" :class="{ animate: isVisible }">
      <div class="ornament-circle">
        <svg class="ornament-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="decorative-dots" :class="{ animate: isVisible }">
      <div class="dot dot-1"></div>
      <div class="dot dot-2"></div>
      <div class="dot dot-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)
const separatorRef = ref(null)

let observer = null

const handleIntersection = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      isVisible.value = true
    }
  })
}

onMounted(() => {
  // Intersection Observer for animation trigger
  observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.5,
    rootMargin: '0px 0px -10% 0px',
  })

  if (separatorRef.value) {
    observer.observe(separatorRef.value)
  }

  // Fallback for immediate visibility
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.separator-container {
  position: relative;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  overflow: hidden;
}

.separator-line-wrapper {
  position: relative;
  width: 100%;
  height: 2px;
  max-width: 600px;
}

.separator-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #000000 20%, #000000 80%, transparent 100%);
  opacity: 0;
  transform: scaleX(0);
  transform-origin: center;
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.separator-line.animate {
  opacity: 1;
  transform: scaleX(1);
}

.separator-glow {
  position: absolute;
  top: -2px;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.1) 20%,
    rgba(0, 0, 0, 0.1) 80%,
    transparent 100%
  );
  opacity: 0;
  transform: scaleX(0);
  transform-origin: center;
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
  filter: blur(3px);
}

.separator-glow.animate {
  opacity: 1;
  transform: scaleX(1);
}

.separator-ornament {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0) rotate(-180deg);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s;
}

.separator-ornament.animate {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1) rotate(0deg);
}

.ornament-circle {
  width: 48px;
  height: 48px;
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ornament-circle:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.ornament-icon {
  width: 20px;
  height: 20px;
  color: #000000;
  transition: color 0.3s ease;
}

.ornament-circle:hover .ornament-icon {
  color: #333333;
}

.decorative-dots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 1s ease 1s;
}

.decorative-dots.animate {
  opacity: 1;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #000000;
  animation: dotPulse 2s infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.3s;
}

.dot-3 {
  animation-delay: 0.6s;
}

@keyframes dotPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

/* Alternative Separator Styles */
.separator-container.minimal {
  height: 80px;
}

.separator-container.minimal .separator-line {
  background: #000000;
  height: 1px;
}

.separator-container.minimal .separator-ornament {
  display: none;
}

.separator-container.minimal .decorative-dots {
  display: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .separator-container {
    height: 100px;
    padding: 1.5rem 1rem;
  }

  .separator-line-wrapper {
    max-width: 400px;
  }

  .ornament-circle {
    width: 40px;
    height: 40px;
  }

  .ornament-icon {
    width: 16px;
    height: 16px;
  }

  .dot {
    width: 3px;
    height: 3px;
  }
}

@media (max-width: 640px) {
  .separator-container {
    height: 80px;
    padding: 1rem 0.75rem;
  }

  .separator-line-wrapper {
    max-width: 300px;
  }

  .ornament-circle {
    width: 36px;
    height: 36px;
    border-width: 1px;
  }

  .ornament-icon {
    width: 14px;
    height: 14px;
  }

  .decorative-dots {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .separator-container {
    height: 60px;
    padding: 0.75rem 0.5rem;
  }

  .separator-line-wrapper {
    max-width: 250px;
  }

  .separator-line,
  .separator-glow {
    height: 1px;
  }

  .separator-glow {
    height: 3px;
    top: -1px;
  }

  .ornament-circle {
    width: 32px;
    height: 32px;
  }

  .ornament-icon {
    width: 12px;
    height: 12px;
  }

  .decorative-dots {
    gap: 4px;
  }

  .dot {
    width: 2px;
    height: 2px;
  }
}

/* Dark theme variant */
.separator-container.dark {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 1rem;
}

.separator-container.dark .separator-line {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.8) 20%,
    rgba(255, 255, 255, 0.8) 80%,
    transparent 100%
  );
}

.separator-container.dark .separator-glow {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.2) 80%,
    transparent 100%
  );
}

.separator-container.dark .ornament-circle {
  background: #000000;
  border-color: #ffffff;
}

.separator-container.dark .ornament-icon {
  color: #ffffff;
}

.separator-container.dark .dot {
  background: #ffffff;
}

/* Focus state for accessibility */
.ornament-circle:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .separator-line,
  .separator-glow,
  .separator-ornament,
  .decorative-dots {
    transition: opacity 0.3s ease;
    transform: none !important;
  }

  .ornament-circle:hover {
    transform: none;
  }

  .dot {
    animation: none;
  }
}
</style>
