<template>
  <section class="showcase-section">
    <!-- Header Section -->
    <div class="header-content">
      <div class="header-badge">
        <svg class="badge-icon" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        Top Companies
      </div>

      <h2 class="section-title">
        Your Next Employer
        <span class="title-highlight">Might Be Here</span>
      </h2>

      <p class="section-description">
        Discover opportunities at leading companies across industries. From innovative startups to
        established enterprises, find your perfect match.
      </p>
    </div>

    <!-- Company Carousel -->
    <div class="carousel-section">
      <CompanyCarousel @company-selected="handleCompanySelection" />
    </div>

    <!-- Separator -->
    <div class="separator-section">
      <Separator />
    </div>

    <!-- Logo Slider Section -->
    <div class="logo-section">
      <div class="logo-header">
        <h3 class="logo-title">Trusted by Industry Leaders</h3>
        <p class="logo-subtitle">
          Join thousands of professionals working at these amazing companies
        </p>
      </div>
      <LogoSlider />
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">500+</div>
          <div class="stat-label">Companies</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">10K+</div>
          <div class="stat-label">Open Positions</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">50K+</div>
          <div class="stat-label">Successful Hires</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">95%</div>
          <div class="stat-label">Satisfaction Rate</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStore } from 'src/stores/company-store'
import CompanyCarousel from './CompanyCarousel.vue'
import LogoSlider from './LogoSlider.vue'
import Separator from './SeperatorComponent.vue'

const emit = defineEmits(['company-selected'])

const store = useStore()

const handleCompanySelection = (company) => {
  emit('company-selected', company)
  // You could also handle routing here
  console.log('Selected company:', company)
}

onMounted(() => {
  store.fetchCompanies()
})
</script>

<style scoped>
.showcase-section {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #ffffff 100%);
  padding: 4rem 2rem;
  position: relative;
  overflow: hidden;
}

/* Background Pattern */
.showcase-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #000000;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
}

.header-badge:hover {
  transform: translateY(-2px);
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #111827;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
}

.title-highlight {
  position: relative;
  color: #000000;
}

.title-highlight::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #000000;
  border-radius: 2px;
}

.section-description {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.carousel-section {
  margin-bottom: 5rem;
  position: relative;
  z-index: 1;
}

.separator-section {
  margin: 4rem 0;
  position: relative;
  z-index: 1;
}

.logo-section {
  margin-bottom: 4rem;
  position: relative;
  z-index: 1;
}

.logo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.logo-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.stats-section {
  background: #000000;
  border-radius: 1rem;
  padding: 3rem 2rem;
  position: relative;
  z-index: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  padding: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  font-size: 1rem;
  color: #d1d5db;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .showcase-section {
    padding: 3rem 1.5rem;
  }

  .header-content {
    margin-bottom: 3rem;
  }

  .carousel-section {
    margin-bottom: 4rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .stats-section {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .showcase-section {
    padding: 2rem 1rem;
  }

  .header-content {
    margin-bottom: 2rem;
  }

  .header-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .section-description {
    font-size: 1rem;
  }

  .carousel-section {
    margin-bottom: 3rem;
  }

  .separator-section {
    margin: 3rem 0;
  }

  .logo-section {
    margin-bottom: 3rem;
  }

  .logo-header {
    margin-bottom: 2rem;
  }

  .logo-title {
    font-size: 1.5rem;
  }

  .logo-subtitle {
    font-size: 0.9rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .stat-label {
    font-size: 0.9rem;
  }
}

@media (max-width: 640px) {
  .showcase-section {
    padding: 1.5rem 0.75rem;
  }

  .header-content {
    margin-bottom: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .stats-section {
    padding: 2rem 1rem;
    border-radius: 0.75rem;
  }

  .stat-item {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .showcase-section {
    padding: 1rem 0.5rem;
  }

  .title-highlight::after {
    height: 2px;
  }

  .stats-section {
    padding: 1.5rem 0.75rem;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}

/* Animation for stats on scroll */
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

.stat-item {
  animation: fadeInUp 0.6s ease-out forwards;
}

.stat-item:nth-child(1) {
  animation-delay: 0.1s;
}
.stat-item:nth-child(2) {
  animation-delay: 0.2s;
}
.stat-item:nth-child(3) {
  animation-delay: 0.3s;
}
.stat-item:nth-child(4) {
  animation-delay: 0.4s;
}

/* Hover effects */
.stat-item:hover .stat-number {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

/* Focus states for accessibility */
.header-badge:focus {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}
</style>
