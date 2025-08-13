<template>
  <div class="company-card">
    <!-- Company Logo -->
    <div class="logo-container">
      <img :src="company.logo" :alt="company.name" class="company-logo" @error="handleImageError" />
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Company Name -->
      <h3 class="company-name">{{ company.name }}</h3>

      <!-- Rating & Reviews -->
      <div class="rating-section">
        <div class="rating-stars">
          <svg class="star-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <span class="rating-value">{{ company.rating }}</span>
        </div>
        <span class="reviews-count">({{ formatReviews(company.reviews) }})</span>
      </div>

      <!-- Description -->
      <p class="company-description">{{ company.description }}</p>
    </div>

    <!-- Action Button -->
    <div class="card-footer">
      <button
        class="view-jobs-btn"
        @click="handleViewJobs"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
      >
        <span>View Jobs</span>
        <svg
          class="arrow-icon"
          :class="{ 'arrow-animated': isHovering }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  company: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['view-jobs'])

const isHovering = ref(false)

const handleImageError = (event) => {
  // Fallback to a default logo or company initial
  event.target.src = `data:image/svg+xml;base64,${btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#f3f4f6"/>
      <text x="50" y="55" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#374151">
        ${props.company.name.charAt(0).toUpperCase()}
      </text>
    </svg>
  `)}`
}

const formatReviews = (reviews) => {
  if (reviews >= 1000) {
    return `${(reviews / 1000).toFixed(1)}k reviews`
  }
  return `${reviews} reviews`
}

const handleViewJobs = () => {
  emit('view-jobs', props.company)
}
</script>

<style scoped>
.company-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 280px;
}

.company-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #000000;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  height: 80px;
}

.company-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 0.5rem;
  background: #f9fafb;
  padding: 0.5rem;
  transition: transform 0.3s ease;
}

.company-card:hover .company-logo {
  transform: scale(1.05);
}

.card-content {
  flex: 1;
  text-align: center;
}

.company-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.rating-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star-icon {
  width: 16px;
  height: 16px;
  color: #000000;
}

.rating-value {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.reviews-count {
  color: #6b7280;
  font-size: 0.875rem;
}

.company-description {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.view-jobs-btn {
  width: 100%;
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.view-jobs-btn:hover {
  background: #ffffff;
  color: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.arrow-animated {
  transform: translateX(4px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .company-card {
    padding: 1rem;
    min-height: 240px;
  }

  .company-name {
    font-size: 1.125rem;
  }

  .company-description {
    font-size: 0.8rem;
  }

  .view-jobs-btn {
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .company-card {
    padding: 0.875rem;
    min-height: 220px;
  }

  .logo-container {
    height: 60px;
    margin-bottom: 0.75rem;
  }

  .company-logo {
    width: 48px;
    height: 48px;
  }

  .company-name {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .rating-section {
    margin-bottom: 0.75rem;
  }

  .card-footer {
    margin-top: 1rem;
    padding-top: 0.75rem;
  }
}

/* Focus states for accessibility */
.view-jobs-btn:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

.company-card:focus-within {
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}
</style>
