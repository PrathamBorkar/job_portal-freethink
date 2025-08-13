<template>
  <q-card class="preview-job-card">
    <div class="preview-job-header">
      <div class="preview-job-title">{{ previewJob.title }}</div>
      <div class="preview-job-company">{{ previewJob.company }}</div>
    </div>

    <q-separator />

    <!-- Job Details Section -->
    <div class="job-details">
      <div class="detail-row">
        <span class="detail-label">Job Type:</span>
        <span class="detail-value">{{ previewJob.job_type }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Mode of Work:</span>
        <span class="detail-value">{{ previewJob.mode_of_work }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Experience:</span>
        <span class="detail-value"
          >{{ previewJob.experience_min }} -
          {{ previewJob.experience_max }} years</span
        >
      </div>

      <div class="detail-row">
        <span class="detail-label">Salary:</span>
        <span class="detail-value"
          >₹{{ previewJob.salary_min }} - ₹{{ previewJob.salary_max }}</span
        >
      </div>

      <div
        class="detail-row"
        v-if="previewJob.equity_min || previewJob.equity_max"
      >
        <span class="detail-label">Equity:</span>
        <span class="detail-value"
          >{{ previewJob.equity_min }}% - {{ previewJob.equity_max }}%</span
        >
      </div>

      <div class="detail-row">
        <span class="detail-label">Openings:</span>
        <span class="detail-value">{{ previewJob.opening }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Qualification:</span>
        <span class="detail-value">{{
          previewJob.qualification || "Not specified"
        }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">{{ previewJob.location }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Skills:</span>
        <span class="detail-value">{{
          previewJob.skillids.join(", ") || "Not specified"
        }}</span>
      </div>
    </div>

    <q-separator />

    <!-- Job Description Section -->
    <div class="job-description">
      <div class="description-header">Short Description</div>
      <div class="description-text">{{ previewJob.smallDescription }}</div>

      <div class="description-header">Detailed Job Description</div>
      <div class="description-text">{{ previewJob.bigDescription }}</div>
    </div>
  </q-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  job: {
    type: Object,
    required: true,
  },
});

const previewJob = computed(() => {
  return {
    title: props.job.title,
    company: props.job.companyName,
    job_type: props.job.job_type,
    mode_of_work: props.job.mode_of_work,
    experience_min: props.job.experience_min,
    experience_max: props.job.experience_max,
    salary_min: props.job.salary_min,
    salary_max: props.job.salary_max,
    equity_min: props.job.equity_min,
    equity_max: props.job.equity_max,
    opening: props.job.opening,
    qualification: props.job.qualification,
    location: props.job.location,
    skillids: props.job.skills,
    smallDescription: props.job.smallDescription,
    bigDescription: props.job.bigDescription,
  };
});
</script>

<style scoped>
.preview-job-card {
  width: 100%;
  padding: 24px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.4), 0 8px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
}

.preview-job-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-job-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.preview-job-company {
  font-size: 16px;
  color: #555;
}

.job-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
}

.detail-label {
  font-weight: 600;
}

.detail-value {
  font-weight: 400;
}

.job-description {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.description-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.description-text {
  font-size: 14px;
  color: #555;
}
</style>
