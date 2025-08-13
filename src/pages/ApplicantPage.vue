<template>
  <q-layout view="lHh Lpr lFf" class="dashboard-layout">
    <q-page class="flex flex-center">
      <q-card class="main-card">
        <TopSection v-model:tab="tab" />
        <BottomOne v-if="tab === 'Details'" />
        <BottomTwo v-else-if="tab === 'Application Status'" />
        <BottomThree v-else-if="tab === 'Resumes & Links'" />
        <JobApplication />
        <JobDetails />
        <CompanyDetails />
      </q-card>
    </q-page>
  </q-layout>
</template>

<script>
import TopSection from 'src/components/user/TopSection.vue'
import BottomOne from 'src/components/user/BottomOne.vue'
import BottomTwo from 'src/components/user/BottomTwo.vue'
import BottomThree from 'src/components/user/BottomThree.vue'

import JobApplication from 'src/components/Jobs/JobApplication.vue'
import JobDetails from 'src/components/Jobs/JobDetails.vue'
import CompanyDetails from 'src/components/Jobs/CompanyDetails.vue'

export default {
  name: 'UserDashboard',
  components: {
    TopSection,
    BottomOne,
    BottomTwo,
    BottomThree,
    JobApplication,
    JobDetails,
    CompanyDetails,
  },
  data() {
    return {
      tab: 'Details',
    }
  },
}
</script>

<style scoped>
.dashboard-layout {
  background-color: #f5f5f5;
}

.main-card {
  width: 90vw;
  max-width: 1200px;
  min-height: 90vh;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

@media (max-width: 900px) {
  .main-card {
    width: 95vw;
    min-height: auto;
    height: auto;
    padding: 16px;
    margin: 16px 0;
  }
}
</style>
