<template>
  <div id="login-button" class="hero-container">
    <q-card class="hero-card">
      <q-card-section class="hero-content">
        <!-- Heading -->
        <h1 class="hero-title">Where startups and job seekers connect</h1>

        <!-- CTA Buttons -->
        <div class="hero-actions">
          <!-- Hire Button -->
          <q-btn
            label="Log in"
            color="dark"
            text-color="white"
            class="hero-btn hero-btn-primary"
            unelevated
            rounded
            no-caps
            size="lg"
            @click="goToLogin"
          />

          <!-- Job Button -->
          <q-btn
            id="register-btn"
            label="Register"
            color="white"
            text-color="dark"
            class="hero-btn hero-btn-secondary"
            rounded
            no-caps
            size="lg"
            outline
            @click="goToRegister"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToRegister = () => {
  router.push('/register')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.hero-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.hero-card {
  width: 100%;
  max-width: 1480px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.hero-content {
  padding: 60px 40px;
  text-align: center;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 40px 0;
  color: #212121;
  line-height: 1.2;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 12px 52px;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.hero-btn-primary {
  background: #212121;
}

.hero-btn-primary:hover {
  background: #424242;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 33, 33, 0.3);
}

.hero-btn-primary:active {
  transform: translateY(0);
}

.hero-btn-secondary {
  border: 2px solid #212121;
}

.hero-btn-secondary:hover {
  background: rgba(33, 33, 33, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 33, 33, 0.1);
}

.hero-btn-secondary:active {
  transform: translateY(0);
}

/* Responsive design */
@media (max-width: 768px) {
  .hero-container {
    padding: 20px;
    min-height: 300px;
  }

  .hero-content {
    padding: 40px 20px;
  }

  .hero-title {
    font-size: 2rem;
    margin-bottom: 30px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .hero-btn {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }
}
</style>
