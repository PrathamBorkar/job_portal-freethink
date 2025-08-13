<template>
  <q-card class="modern-right-card" flat bordered>
    <ApplicantHome v-if="props.component == 'ApplicantHome'" />
    <ApplicantApplications v-else-if="props.component == 'ApplicantApplications'" />
    <ApplicantResume v-else-if="props.component == 'ApplicantResume'" />
    <EditApplicant v-else-if="props.component == 'EditApplicant'" />
    <SpecialFeature v-else-if="props.component == 'SpecialFeature'" />
    <RecruiterHome v-else-if="props.component == 'RecruiterHome'" />
    <JobsPosted v-else-if="props.component == 'JobsPosted'" />
    <CreateJob v-else-if="props.component == 'CreateJob'" />
    <RecruiterEdit v-else-if="props.component == 'RecruiterEdit'" />
    <JobApplication />

    <!-- Add the TwoCardDialog here for job detail dialog -->
    <JobDetails />
    <CompanyDetails />
  </q-card>
</template>

<script setup>
import ApplicantHome from 'src/components/ApplicantDashboard/ApplicantHome.vue'
import ApplicantApplications from 'src/components/ApplicantDashboard/ApplicantApplications.vue'
import ApplicantResume from 'src/components/ApplicantDashboard/ApplicantResume.vue'
import EditApplicant from 'src/components/ApplicantDashboard/EditApplicant.vue'
import SpecialFeature from 'src/components/ApplicantDashboard/SpecialFeature.vue'
import RecruiterHome from 'src/components/RecruiterDashboard/RecruiterHome.vue'
import JobsPosted from 'src/components/RecruiterDashboard/JobsPosted.vue'
import CreateJob from 'src/components/RecruiterDashboard/CreateJob.vue'
import RecruiterEdit from 'src/components/RecruiterDashboard/RecruiterEdit.vue'
import JobDetails from '../Jobs/JobDetails.vue'
import CompanyDetails from '../Jobs/CompanyDetails.vue'
import JobApplication from '../Jobs/JobApplication.vue'
const props = defineProps({
  component: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.modern-right-card {
  height: 80vh;
  width: 100%;
  border-radius: 16px;
  overflow: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  position: relative;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.modern-right-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px);
  border-color: rgba(0, 0, 0, 0.08) !important;
}

@media (max-width: 599px) {
  .modern-right-card {
    height: 70vh;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .modern-right-card {
    height: 75vh;
  }
}

@media (min-width: 1024px) {
  .modern-right-card {
    height: 80vh;
  }
}
</style>
