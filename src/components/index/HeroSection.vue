<template>
  <div
    ref="hero"
    class="hero-wrapper"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    @mousemove.passive="onMouseMove"
  >
    <!-- Hero Title -->
    <div ref="titleEl" class="hero-title">
      <span class="main-text">Find what's <span class="highlighted">next</span></span>
    </div>

    <!-- Hero Subtitle -->
    <p class="hero-subtitle">Discover opportunities, connect with talent, and build the future</p>

    <!-- CTA Buttons -->
    <div class="cta-buttons">
      <a href="#login-button" class="btn btn-primary">Get Started</a>
      <q-btn to="/all-jobs" class="btn btn-secondary">Checkout jobs</q-btn>
    </div>

    <!-- Animated Floating Tags for Large Screens -->
    <div v-if="isLargeScreen" ref="tagContainer" class="tag-container">
      <div
        v-for="(tag, index) in tags"
        :key="index"
        class="tag"
        :class="{ hovered: hoveredTagIndexes.includes(index) }"
        :style="tag.style"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave(index)"
      >
        {{ tag.text }}
      </div>
    </div>

    <!-- Static Tags for Medium and Small Screens -->
    <div v-else class="static-tag-section">
      <div class="static-tags">
        <div
          v-for="(tag, index) in getVisibleTags()"
          :key="index"
          class="static-tag"
          :class="{ 'static-tag-hover': hoveredTagIndexes.includes(index) }"
          @mouseenter="handleMouseEnter(index)"
          @mouseleave="handleMouseLeave(index)"
        >
          {{ tag.text }}
        </div>
      </div>

      <!-- Show More Button for Mobile -->
      <button v-if="isMobile && !showAllTags" @click="showAllTags = true" class="show-more-btn">
        Show More Tags
      </button>
    </div>

    <!-- Background Pattern -->
    <div class="background-pattern"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import gsap from 'gsap'

// Refs & State
const hero = ref(null)
const tagContainer = ref(null)
const isHovering = ref(false)
const windowWidth = ref(window.innerWidth)
const hoveredTagIndexes = ref([])
const showAllTags = ref(false)

// Responsive breakpoints
const isLargeScreen = computed(() => windowWidth.value >= 1280)
const isMediumScreen = computed(() => windowWidth.value >= 768 && windowWidth.value < 1280)
const isMobile = computed(() => windowWidth.value < 768)

let tagTweens = []
let rafPending = false
let lastEvent = null

// Tags Data
const tags = [
  { text: 'Vue JS Developers', style: { top: '44%', left: '7%' } },
  { text: 'Cyber Security', style: { top: '36%', left: '22%' } },
  { text: 'iOS Developers', style: { top: '65%', left: '12%' } },
  { text: 'Robotics', style: { top: '72%', left: '20%' } },
  { text: 'Boston', style: { top: '80%', left: '29%' } },
  { text: 'Blockchain Developers', style: { top: '74%', left: '38%' } },
  { text: 'San Francisco', style: { top: '72%', left: '60%' } },
  { text: 'React Developers', style: { top: '58%', left: '68%' } },
  { text: 'Artificial Intelligence', style: { top: '64%', left: '72%' } },
  { text: 'Los Angeles', style: { top: '52%', left: '85%' } },
  { text: 'SaaS', style: { top: '26%', left: '78%' } },
  { text: 'New York', style: { top: '18%', left: '72%' } },
  { text: 'Databases', style: { top: '18%', left: '60%' } },
  { text: 'Mental Health', style: { top: '20%', left: '42%' } },
  { text: 'Seattle', style: { top: '70%', left: '85%' } },
  { text: 'Hardware', style: { top: '82%', left: '92%' } },
  { text: 'Cloud Computing', style: { top: '22%', left: '10%' } },
  { text: 'Edge AI', style: { top: '30%', left: '88%' } },
  { text: 'UX Designers', style: { top: '48%', left: '18%' } },
  { text: 'Data Scientists', style: { top: '54%', left: '50%' } },
  { text: 'DevOps Engineers', style: { top: '40%', left: '40%' } },
  { text: 'Toronto', style: { top: '66%', left: '74%' } },
  { text: 'London', style: { top: '58%', left: '8%' } },
  { text: 'Kubernetes', style: { top: '76%', left: '48%' } },
  { text: 'UI Engineers', style: { top: '32%', left: '60%' } },
  { text: 'Berlin', style: { top: '46%', left: '92%' } },
  { text: 'Machine Learning', style: { top: '12%', left: '15%' } },
  { text: 'NLP Engineers', style: { top: '16%', left: '30%' } },
  { text: 'Product Managers', style: { top: '10%', left: '48%' } },
  { text: 'Game Developers', style: { top: '28%', left: '25%' } },
  { text: 'Mobile Developers', style: { top: '34%', left: '85%' } },
  { text: 'Fintech', style: { top: '42%', left: '74%' } },
  { text: 'Healthcare Tech', style: { top: '38%', left: '14%' } },
  { text: 'AI Ethics', style: { top: '22%', left: '92%' } },
  { text: 'C++ Developers', style: { top: '50%', left: '33%' } },
  { text: '3D Artists', style: { top: '62%', left: '58%' } },
  { text: 'AR/VR Engineers', style: { top: '56%', left: '88%' } },
  { text: 'AI Hardware', style: { top: '70%', left: '10%' } },
  { text: 'Remote Teams', style: { top: '75%', left: '15%' } },
  { text: 'Python Developers', style: { top: '48%', left: '60%' } },
  { text: 'Rust Developers', style: { top: '52%', left: '5%' } },
  { text: 'Quantum Computing', style: { top: '60%', left: '10%' } },
  { text: 'Chicago', style: { top: '66%', left: '42%' } },
  { text: 'AI Researchers', style: { top: '78%', left: '67%' } },
  { text: 'Edge Computing', style: { top: '26%', left: '50%' } },
  { text: 'Agile Coaches', style: { top: '20%', left: '33%' } },
  { text: 'Cyber Law', style: { top: '14%', left: '62%' } },
  { text: 'AI Startups', style: { top: '68%', left: '56%' } },
  { text: 'Tech Writers', style: { top: '18%', left: '88%' } },
  { text: 'Open Source Devs', style: { top: '24%', left: '66%' } },
]

// Get visible tags based on screen size
function getVisibleTags() {
  if (isMobile.value) {
    return showAllTags.value ? tags.slice(0, 12) : tags.slice(0, 6)
  } else if (isMediumScreen.value) {
    return tags.slice(0, 15)
  }
  return tags.slice(0, 20)
}

// Resize handler
function updateScreenSize() {
  const wasLargeScreen = isLargeScreen.value
  windowWidth.value = window.innerWidth

  if (!wasLargeScreen && isLargeScreen.value) {
    nextTick(runEntranceAnimation)
  }
}

// Entrance animation for tags
function runEntranceAnimation() {
  const tagEls = tagContainer.value?.querySelectorAll('.tag') || []
  tagTweens = []

  tagEls.forEach((el) => {
    const fromX = (Math.random() - 0.5) * window.innerWidth * 2
    const fromY = (Math.random() - 0.5) * window.innerHeight * 2
    el.dataset.factor = (0.5 + Math.random() * 0.8).toFixed(2)

    gsap.fromTo(
      el,
      { x: fromX, y: fromY, opacity: 0 },
      {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        delay: Math.random() * 0.3,
        onComplete() {
          el._baseY = 0
          gsap.to(el, {
            y: '+=18',
            duration: 1 + Math.random() * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random() * 0.7,
            onUpdate() {
              el._floatY = gsap.getProperty(el, 'y')
              applyOffset(el)
            },
          })

          tagTweens.push({
            el,
            tweenX: gsap.quickTo(el, 'x', {
              duration: 1.7,
              ease: 'power3.out',
            }),
            tweenY: gsap.quickTo(el, 'y', {
              duration: 1.7,
              ease: 'power3.out',
            }),
            tweenO: gsap.quickTo(el, 'opacity', {
              duration: 0.4,
              ease: 'sine.out',
            }),
          })
        },
      },
    )
  })
}

// Mouse move handler (throttled)
function onMouseMove(e) {
  lastEvent = e
  if (!rafPending) {
    rafPending = true
    requestAnimationFrame(() => {
      if (isHovering.value && isLargeScreen.value) {
        moveTags(lastEvent)
      }
      rafPending = false
    })
  }
}

// Update tag offsets based on mouse position
function moveTags(e) {
  const rect = hero.value.getBoundingClientRect()
  const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
  const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 2

  tagTweens.forEach(({ el, tweenO }) => {
    const factor = parseFloat(el.dataset.factor)
    const maxOffset = 90

    el._offsetX = -relX * maxOffset * factor
    el._offsetY = -relY * maxOffset * factor

    applyOffset(el)

    // Fade based on visibility
    const tagRect = el.getBoundingClientRect()
    const margin = 60
    const fX = Math.min(
      1,
      Math.max(0, (rect.right - tagRect.left) / margin, (tagRect.right - rect.left) / margin),
    )
    const fY = Math.min(
      1,
      Math.max(0, (rect.bottom - tagRect.top) / margin, (tagRect.bottom - rect.top) / margin),
    )

    tweenO?.(Math.min(fX, fY))
  })
}

// Apply floating offset to tag
function applyOffset(el) {
  const offX = el._offsetX || 0
  const offY = el._offsetY || 0
  const tween = tagTweens.find((t) => t.el === el)
  if (tween) {
    tween.tweenX(offX)
    tween.tweenY((el._floatY || 0) + offY)
  }
}

// Tag hover
function handleMouseEnter(index) {
  tags[index].__hoverTimer = setTimeout(() => {
    if (!hoveredTagIndexes.value.includes(index)) {
      hoveredTagIndexes.value.push(index)
    }
  }, 200)
}

function handleMouseLeave(index) {
  clearTimeout(tags[index].__hoverTimer)
  hoveredTagIndexes.value = hoveredTagIndexes.value.filter((i) => i !== index)
}

// Watch hover reset
watch(isHovering, (hovering) => {
  if (!hovering) {
    tagTweens.forEach(({ el }) => {
      el._offsetX = 0
      el._offsetY = 0
      applyOffset(el)
    })
  }
})

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', updateScreenSize)
  if (isLargeScreen.value) {
    runEntranceAnimation()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
.hero-wrapper {
  width: 100%;
  min-height: 75vh;
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  overflow: hidden;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1.5rem;
  z-index: 3;
  position: relative;
  text-align: center;
  line-height: 1.1;
}

@media (max-width: 768px) {
  .hero-title {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.prefix {
  font-weight: 700;
  color: #000;
  position: relative;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #000;
  border-radius: 50%;
  margin-left: 2px;
}

.main-text {
  color: #111;
}

.highlighted {
  border: 2px solid #000;
  border-radius: 0.375rem;
  padding: 0.25rem 0.75rem;
  margin-left: 0.5rem;
  background: #000;
  color: #fff;
  transition: all 0.3s ease;
}

.highlighted:hover {
  background: #333;
  transform: translateY(-2px);
}

.hero-subtitle {
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
  z-index: 3;
  position: relative;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  z-index: 3;
  position: relative;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}

.btn-primary {
  background: #000;
  color: #fff;
  border-color: #000;
}

.btn-primary:hover {
  background: #333;
  border-color: #333;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: transparent;
  color: #000;
  border-color: #000;
}

.btn-secondary:hover {
  background: #000;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

@media (max-width: 640px) {
  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    min-width: 120px;
  }
}

.tag-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.tag {
  position: absolute;
  padding: 0.75rem 1.125rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: #374151;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: auto;
  cursor: pointer;
}

.tag.hovered {
  background: #000;
  border-color: #000;
  color: #fff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.static-tag-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
}

.static-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  width: 100%;
}

.static-tag {
  padding: 0.625rem 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.static-tag:hover,
.static-tag-hover {
  background: #000;
  border-color: #000;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.show-more-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #000;
  border: 2px solid #000;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.show-more-btn:hover {
  background: #000;
  color: #fff;
  transform: translateY(-2px);
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.02) 0%, transparent 50%);
  z-index: 0;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .hero-wrapper {
    padding: 1.5rem 1rem;
    min-height: 90vh;
  }

  .static-tags {
    gap: 0.5rem;
  }

  .static-tag {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}

/* Tablet optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  .hero-wrapper {
    padding: 2rem 1.5rem;
  }
}

/* Animation for entrance */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title,
.hero-subtitle,
.cta-buttons {
  animation: fadeInUp 0.8s ease-out forwards;
}

.hero-subtitle {
  animation-delay: 0.2s;
}

.cta-buttons {
  animation-delay: 0.4s;
}
</style>
