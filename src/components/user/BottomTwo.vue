<template>
  <div class="bottom-section row q-mt-sm">
    <!-- LEFT SIDE -->
    <div class="left-side">
      <q-card class="application-status-card widget">
        <div class="text-h6">Application Status</div>

        <!-- Filter -->
        <q-select
          v-model="selectedFilter"
          :options="filterOptions"
          label="Filter by Job Status"
          dense
          outlined
          class="q-mt-sm"
          clearable
        />

        <!-- Jobs List -->
        <div class="q-mt-md">
          <q-card v-for="job in filteredJobs" :key="job.id" class="job-card q-mb-md">
            <q-card-section>
              <div class="row justify-between items-center">
                <div class="text-subtitle1">{{ job.title }}</div>
                <q-badge :color="statusColor(job.status)" outline class="q-ml-sm">
                  {{ job.status }}
                </q-badge>
              </div>
              <div class="text-caption text-grey q-mt-xs">
                Feedback: {{ job.feedback || 'No feedback yet' }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomTwo',
  data() {
    return {
      selectedFilter: null,
      jobs: [
        {
          id: 1,
          title: 'Frontend Developer',
          status: 'Applied',
          feedback: 'We have received your application.',
        },
        {
          id: 2,
          title: 'Backend Developer',
          status: 'In Review',
          feedback: 'Your profile is under review.',
        },
        {
          id: 3,
          title: 'UI Designer',
          status: 'Rejected',
          feedback: 'Unfortunately, you were not selected.',
        },
        {
          id: 4,
          title: 'Project Manager',
          status: 'Accepted',
          feedback: 'You have been selected!',
        },
      ],
    }
  },
  computed: {
    filterOptions() {
      const uniqueStatuses = [...new Set(this.jobs.map((job) => job.status))]
      return uniqueStatuses.filter((status) => status !== 'Interview Scheduled')
    },
    filteredJobs() {
      if (!this.selectedFilter) return this.jobs
      return this.jobs.filter((job) => job.status === this.selectedFilter)
    },
  },
  methods: {
    statusColor(status) {
      switch (status) {
        case 'Applied':
          return 'blue'
        case 'In Review':
          return 'orange'
        case 'Accepted':
          return 'green'
        case 'Rejected':
          return 'red'
        default:
          return 'grey'
      }
    },
  },
}
</script>

<style scoped>
.bottom-section {
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
}

.left-side {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.widget {
  flex: 1;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.text-h6 {
  font-weight: 600;
  color: #212121;
  margin-bottom: 16px;
}

.q-select :deep(.q-field__control) {
  border-radius: 8px;
}

.job-card {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.job-card:hover {
  border-color: #bdbdbd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.q-badge {
  border-radius: 4px;
  font-weight: 500;
}

@media (max-width: 900px) {
  .bottom-section {
    flex-direction: column;
  }

  .widget {
    max-height: none;
  }
}

.widget::-webkit-scrollbar {
  width: 6px;
}

.widget::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 3px;
}

.widget::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
</style>
