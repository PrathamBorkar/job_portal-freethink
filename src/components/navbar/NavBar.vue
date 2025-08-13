<template>
  <q-header elevated class="navbar">
    <q-toolbar class="q-px-none">
      <!-- Logo on left -->
      <div class="logo-container">
        <img src="../../assets/logo.png" alt="Company Logo" class="logo" />
        <span class="company-name">TalentConnect</span>
      </div>

      <q-space />

      <!-- Desktop Navigation -->
      <div class="desktop-nav gt-sm">
        <q-btn
          v-for="nav in navigation"
          :key="nav.name"
          flat
          exact
          class="nav-btn"
          :class="{ active: props.current === nav.name }"
          @click="nav.changeValue"
        >
          {{ nav.label }}
        </q-btn>
        <q-btn flat exact class="nav-btn" @click="logOut"> Log out </q-btn>
      </div>

      <!-- Mobile menu button -->
      <q-btn
        flat
        dense
        round
        color="black"
        icon="menu"
        aria-label="Menu"
        class="lt-md"
        @click="toggleRightDrawer"
      />
    </q-toolbar>

    <!-- Mobile Drawer -->
    <q-drawer v-model="rightDrawerOpen" side="right" bordered class="mobile-drawer">
      <q-list>
        <q-item-label header class="drawer-header">Menu</q-item-label>
        <q-item
          v-for="nav in navigation"
          :key="nav.name"
          clickable
          :to="nav.route"
          exact
          class="drawer-item"
          :class="{ active: $route.path === nav.route }"
        >
          <q-item-section>
            <q-item-label>{{ nav.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </q-header>
</template>

<script setup>
import { useUserStore } from 'src/stores/user-store'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const rightDrawerOpen = ref(false)
const router = useRouter()

const props = defineProps({
  current: String,
  navigation: {
    type: Array,
    required: true,
  },
})

const navigation = ref(props.navigation)

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

const logOut = () => {
  useUserStore().setEverythingToNull()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background-color: white;
  height: auto;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.logo-container {
  display: flex;
  align-items: center;
  padding-left: 24px;
}

.logo {
  height: 36px;
  width: auto;
  margin-right: 12px;
}

.company-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  margin-right: 16px;
}

.nav-btn {
  color: #4b5563;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-transform: capitalize;
}

.nav-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.nav-btn.active {
  background-color: #dfdfe0;
  color: #111827;
  font-weight: 600;
}

/* Mobile Drawer */
.mobile-drawer {
  background-color: white;
}

.drawer-header {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  padding: 16px;
}

.drawer-item {
  color: #4b5563;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 4px 8px;
  transition: all 0.2s ease;
}

.drawer-item:hover {
  background-color: #f3f4f6;
}

.drawer-item.active {
  background-color: #f3f4f6;
  color: #111827;
  font-weight: 500;
}
</style>
