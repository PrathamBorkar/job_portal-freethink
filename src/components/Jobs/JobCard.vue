<template>
  <q-card class="company-job-card q-pa-md q-mb-md full-width" flat bordered>
    <!-- Top Row: Logo, Name, Status -->
    <div class="row items-start q-gutter-sm cursor-pointer" @click="openCompanyDialog">
      <q-avatar size="64px">
        <img :src="normalizedJob.logo || 'https://via.placeholder.com/64'" />
      </q-avatar>

      <div class="col">
        <div class="row items-center q-gutter-xs">
          <div class="text-subtitle1 text-weight-bold">
            {{ normalizedJob.company.name || 'Unknown Company' }}
          </div>

          <!-- Company Status -->
          <div v-if="normalizedJob.company.status" class="custom-chip custom-chip-black">
            {{ normalizedJob.company.status }}
          </div>

          <!-- Company Type -->
          <div
            v-for="(type, i) in normalizedJob.company.type || []"
            :key="'type-' + i"
            class="custom-chip custom-chip-blue"
          >
            {{ type }}
          </div>

          <!-- Job Type -->
          <div v-if="normalizedJob.job_type" class="custom-chip custom-chip-blue">
            {{ normalizedJob.job_type }}
          </div>
        </div>

        <div class="description-text">
          {{ normalizedJob.bigDescription?.slice(0, 100) || 'No description.' }}
        </div>

        <!-- Company Size displayed here (instead of openings) -->
        <div class="text-caption text-grey-6">
          Company Size: {{ normalizedJob.company.size || 'Not specified' }}
        </div>
      </div>
    </div>

    <!-- Company Tags -->
    <div class="row q-mt-sm q-gutter-xs">
      <div
        v-for="(tag, i) in normalizedJob.company.tags || []"
        :key="'tag-' + i"
        class="custom-chip custom-chip-pink row items-center no-wrap"
      >
        <span class="chip-label">{{ tag }}</span>
      </div>
    </div>

    <!-- Job Details Inner Card -->
    <div class="q-mt-xs q-mx-none">
      <q-card class="inner-job-card q-py-xs q-px-md q-mx-none" flat bordered @click.stop>
        <div class="row q-col-gutter-sm items-center justify-between">
          <!-- Job info (left) -->
          <div class="col-8 col-md-8">
            <div class="job-title text-body2 text-weight-bold text-black">
              {{ normalizedJob.title }}
            </div>

            <div class="job-meta text-body2 text-grey-8">
              {{ normalizedJob.location }} • {{ formattedSalary }} • Openings:
              {{ normalizedJob.opening || 'Not specified' }}
            </div>
          </div>

          <!-- Buttons (right) -->
          <div class="col-4 col-md-4 text-right">
            <div class="row items-center justify-end q-gutter-sm no-wrap">
              <div>
                <div class="text-caption text-positive text-uppercase">
                  Recruiter Recently Active
                </div>
                <div class="text-caption text-grey-6">Posted {{ formattedPosted }}</div>
              </div>
              <q-btn
                flat
                dense
                label="Apply"
                class="btn-outline-black equal-button"
                type="button"
                @click.stop="applyForJob"
              />
              <q-btn
                unelevated
                dense
                label="Learn More"
                class="btn-filled-black equal-button"
                type="button"
                @click.stop="learnMoreForJob"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <!-- Footer Options -->
    <div class="row items-center justify-end q-mt-sm q-gutter-md" @click.stop>
      <div class="report-hide-item row items-center cursor-pointer text-grey-7 text-caption">
        <q-icon name="bookmark" size="16px" class="q-mr-xs" />
        <span>Save</span>
      </div>
      <div class="report-hide-item row items-center cursor-pointer text-grey-7 text-caption">
        <q-icon name="block" size="16px" class="q-mr-xs" />
        <span>Hide</span>
      </div>
    </div>

    <div class="arrow-symbol">&gt;</div>
  </q-card>
</template>

<script>
import { useUserStore } from 'src/stores/user-store'
import { useJobsStore } from '../../stores/job-store'

export default {
  name: 'JobCard',
  props: {
    job: {
      type: Object,
      required: true,
    },
  },

  computed: {
    userStore() {
      return useUserStore()
    },

    normalizedJob() {
      const raw = this.job
      return {
        company: {
          name: raw.company_name || 'Unknown Company',
          status: raw.company_status || '',
          size: raw.companySize || '',
          type: raw.company_type || [],
          tags: raw.company_tags || [],
        },
        job_type: raw.job_type || '',
        bigDescription: raw.bigDescription || '',
        opening: raw.opening || 'Not specified',
        title: raw.custom_title || raw.job_roles || 'Job Title',
        location: raw.locations || 'Location Unknown',
        salary: {
          min: raw.salary_min || 0,
          max: raw.salary_max || 0,
          currency: 'INR',
        },
        posted: raw.posted || '',
        cid: raw.company_id,
        jobid: raw.jobid,
        logo: raw.logo || null,
      }
    },

    uid() {
      return this.userStore.uid
    },

    formattedSalary() {
      if (!this.normalizedJob.salary) return 'N/A'
      const { min, max, currency = 'INR' } = this.normalizedJob.salary
      if (min >= 100000) {
        return `${currency === 'INR' ? '₹' : currency} ${(min / 100000).toFixed(
          1,
        )}L – ${(max / 100000).toFixed(1)}L`
      }
      if (min >= 1000) {
        return `${currency === 'INR' ? '₹' : currency} ${(min / 1000).toFixed(
          1,
        )}K – ${(max / 1000).toFixed(1)}K`
      }
      return `${currency === 'INR' ? '₹' : currency} ${min} – ${max}`
    },
    formattedPosted() {
      if (!this.normalizedJob.posted) return 'Unknown'
      const date = new Date(this.normalizedJob.posted)
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },
  },
  methods: {
    async applyForJob() {
      if (!this.normalizedJob.jobid) {
        console.error('Missing jobid for application')
        return
      }
      const jobsStore = useJobsStore()
      await jobsStore.openApplicationDialog(this.normalizedJob.jobid)
    },

    async learnMoreForJob() {
      if (!this.normalizedJob.jobid) {
        console.error('Missing jobid for learn more')
        return
      }
      const jobsStore = useJobsStore()
      await jobsStore.openLearnMoreDialog(this.normalizedJob.jobid)
    },

    async openCompanyDialog() {
      if (!this.normalizedJob.cid) {
        console.error('Missing company id (cid) to open company dialog')
        return
      }
      const jobsStore = useJobsStore()
      await jobsStore.openCompanyDialog(this.normalizedJob.cid)
    },
  },
}
</script>

<style scoped>
.company-job-card {
  background-color: #f9f9f9;
  border-radius: 0px;
  transition: box-shadow 0.3s;
  position: relative;
  width: 100%;
}

.inner-job-card {
  background-color: #ffffff;
  border-radius: 0px;
  cursor: pointer;
  transition: background-color 0.2s;
  overflow: hidden;
  width: 100%;
}
.inner-job-card:hover {
  background-color: #f9f9f9;
}
.custom-chip {
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  cursor: default;
}
.custom-chip-pink {
  border: 1px solid #ff4c61;
  background-color: #fff1f3;
  color: #1d1d1f;
}
.custom-chip-blue {
  border: 1px solid #007aff;
  background-color: #f0f7ff;
  color: #1d1d1f;
}
.custom-chip-black {
  border: 1px solid #28a745;
  background-color: #e6f4ea;
  color: #1d1d1f;
}
.chip-label {
  padding: 0 6px;
}
.equal-button {
  width: 100px;
  padding: 2px 8px;
  font-weight: 600;
  font-size: 14px;
  text-transform: none;
  border-radius: 4px;
}
.btn-outline-black {
  border: 1px solid black;
  color: black;
  background-color: white;
}
.btn-filled-black {
  background-color: black;
  color: white;
}
.description-text {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #1d1d1f;
  line-height: 1.4;
}
.arrow-symbol {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  color: #999999;
}
.custom-logo-avatar {
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 4px;
}
.custom-logo-avatar img {
  border-radius: 12px;
}
.job-meta {
  font-size: 14px;
  color: #666;
}
.job-title {
  font-size: 15px;
  font-weight: 600;
  color: #000000;
  line-height: 20px;
}
</style>
