<template>
  <q-card class="application-status-card q-pa-md">
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
      <q-card
        v-for="job in filteredJobs"
        :key="job.id"
        class="job-card q-mb-md"
      >
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-subtitle1">{{ job.title }}</div>
            <q-badge :color="statusColor(job.status)" outline class="q-ml-sm">
              {{ job.status }}
            </q-badge>
          </div>
          <div class="text-caption text-grey q-mt-xs">
            Feedback: {{ job.feedback || "No feedback yet" }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-card>
</template>

<script>
export default {
  name: "ApplicationStatus",

  data() {
    return {
      selectedFilter: null,
      jobs: [
        {
          id: 1,
          title: "Frontend Developer",
          status: "Applied",
          feedback: "We have received your application.",
        },
        {
          id: 2,
          title: "Backend Developer",
          status: "In Review",
          feedback: "Your profile is under review.",
        },
        {
          id: 3,
          title: "UI Designer",
          status: "Rejected",
          feedback: "Unfortunately, you were not selected.",
        },
        {
          id: 4,
          title: "Project Manager",
          status: "Accepted",
          feedback: "You have been selected!",
        },
      ],
    };
  },

  computed: {
    filterOptions() {
      const uniqueStatuses = [...new Set(this.jobs.map((job) => job.status))];
      return uniqueStatuses.filter(
        (status) => status !== "Interview Scheduled"
      );
    },

    filteredJobs() {
      if (!this.selectedFilter) return this.jobs;
      return this.jobs.filter((job) => job.status === this.selectedFilter);
    },
  },

  methods: {
    statusColor(status) {
      switch (status) {
        case "Applied":
          return "blue";
        case "In Review":
          return "orange";
        case "Accepted":
          return "green";
        case "Rejected":
          return "red";
        default:
          return "grey";
      }
    },
  },
};
</script>

<style scoped>
.application-status-card {
  width: 100%;
  border-radius: 24px;
  padding: 24px;
  background: transparent;
}

.job-card {
  border: 1px solid #e0e0e0;
  border-radius: 16px;
}
</style>
