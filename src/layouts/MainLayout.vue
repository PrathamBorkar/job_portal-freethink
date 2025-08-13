<template>
  <q-layout view="lhh Lpr lFf" class="main-layout">
    <Navbar
      :current="RightComponent"
      :navigation="useUserStore().role == 'applicant' ? applicantNavLinks : recruiterNavLinks"
    />
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <div class="full-height left-card-wrapper">
              <LeftCard />
            </div>
          </div>

          <div class="col-12 col-md-9">
            <div class="full-height right-card-wrapper">
              <RightCard :component="RightComponent" />
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import Navbar from 'src/components/navbar/NavBar.vue'
import RightCard from 'src/components/user/RightCard.vue'
import LeftCard from 'src/components/user/LeftCard.vue'
import { ref } from 'vue'
import { useUserStore } from 'src/stores/user-store'

const RightComponent = ref(useUserStore().role == 'applicant' ? 'ApplicantHome' : 'RecruiterHome')

const applicantNavLinks = [
  {
    name: 'ApplicantHome',
    label: 'ApplicantHome',
    changeValue: () => {
      RightComponent.value = 'ApplicantHome'
    },
  },
  {
    name: 'ApplicantApplications',
    label: 'ApplicantApplications',
    changeValue: () => {
      RightComponent.value = 'ApplicantApplications'
    },
  },
  {
    name: 'ApplicantResume',
    label: 'ApplicantResume',
    changeValue: () => {
      RightComponent.value = 'ApplicantResume'
    },
  },
  {
    name: 'EditApplicant',
    label: 'EditApplicant',
    changeValue: () => {
      RightComponent.value = 'EditApplicant'
    },
  },
  {
    name: 'SpecialFeature',
    label: 'SpecialFeature',
    changeValue: () => {
      RightComponent.value = 'SpecialFeature'
    },
  },
]

const recruiterNavLinks = [
  {
    name: 'RecruiterHome',
    label: 'RecruiterHome',
    changeValue: () => {
      RightComponent.value = 'RecruiterHome'
    },
  },
  {
    name: 'JobsPosted',
    label: 'JobsPosted',
    changeValue: () => {
      RightComponent.value = 'JobsPosted'
    },
  },
  {
    name: 'CreateJob',
    label: 'CreateJob',
    changeValue: () => {
      RightComponent.value = 'CreateJob'
    },
  },
  {
    name: 'RecruiterEdit',
    label: 'RecruiterEdit',
    changeValue: () => {
      RightComponent.value = 'RecruiterEdit'
    },
  },
]
</script>

<style scoped>
.main-layout {
  background-color: #f9fafb;
}

.full-height {
  height: 100%;
}

.right-card-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
}

.left-card-wrapper {
  display: flex;
  justify-content: center;
  align-items: start;
  padding: 15px;
}
</style>
