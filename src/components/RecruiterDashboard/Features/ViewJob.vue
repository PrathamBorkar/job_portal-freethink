<template>
  <div class="job-details-container">
    <div class="job-details-card">
      <!-- Header -->
      <div class="card-header">
        <div class="header-left">
          <button class="back-btn" @click="props.goBack">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="page-title">Job Details</h1>
            <p class="page-subtitle">Manage job posting information</p>
          </div>
        </div>

        <div class="header-actions">
          <button v-if="!isEditing" class="btn btn-primary" @click="startEditing">Edit</button>
          <div v-else class="edit-actions">
            <button class="btn btn-secondary" @click="cancelEditing">Cancel</button>
            <button class="btn btn-primary" @click="saveChanges">Save Changes</button>
          </div>
          <button class="btn btn-danger" @click="confirmDeleteJob(job)">Delete</button>
        </div>
      </div>

      <!-- Content -->
      <div class="card-content">
        <form class="job-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h3 class="section-title">Basic Information</h3>
            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Job Title</label>
                <input
                  v-model="editedJob.title"
                  type="text"
                  class="form-input"
                  :disabled="!isEditing"
                  placeholder="Enter job title"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Short Description</label>
                <input
                  v-model="editedJob.smallDescription"
                  type="text"
                  class="form-input"
                  :disabled="!isEditing"
                  placeholder="Brief job description"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Detailed Description</label>
                <textarea
                  v-model="editedJob.bigDescription"
                  class="form-textarea"
                  :disabled="!isEditing"
                  rows="4"
                  placeholder="Detailed job description and requirements"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Job Configuration -->
          <div class="form-section">
            <h3 class="section-title">Job Configuration</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Job Type</label>
                <select v-model="editedJob.job_type" class="form-select" :disabled="!isEditing">
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Co-founder">Co-founder</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Work Mode</label>
                <select v-model="editedJob.mode_of_work" class="form-select" :disabled="!isEditing">
                  <option value="">Select work mode</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Experience Required</label>
                <div class="input-with-suffix">
                  <input
                    v-model="editedJob.experience_min"
                    type="number"
                    class="form-input"
                    :disabled="!isEditing"
                    placeholder="0"
                    min="0"
                  />
                  <span class="input-suffix">years (min)</span>
                </div>
                <div class="input-with-suffix">
                  <input
                    v-model="editedJob.experience_max"
                    type="number"
                    class="form-input"
                    :disabled="!isEditing"
                    placeholder="0"
                    min="0"
                  />
                  <span class="input-suffix">years (max)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Compensation -->
          <div class="form-section">
            <h3 class="section-title">Compensation</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Salary</label>
                <div class="input-with-prefix">
                  <span class="input-prefix">₹</span>
                  <input
                    v-model="editedJob.salary_min"
                    type="number"
                    class="form-input"
                    :disabled="!isEditing"
                    placeholder="Min salary"
                    min="0"
                  />
                </div>
                <div class="input-with-prefix">
                  <span class="input-prefix">₹</span>
                  <input
                    v-model="editedJob.salary_max"
                    type="number"
                    class="form-input"
                    :disabled="!isEditing"
                    placeholder="Max salary"
                    min="0"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Equity</label>
                <div class="input-with-suffix">
                  <input
                    v-model="editedJob.equity_min"
                    type="number"
                    class="form-input"
                    :disabled="!isEditing"
                    placeholder="Min equity"
                    min="0"
                    step="0.1"
                  />
                  <span class="input-suffix">%</span>
                </div>
                <div class="input-with-suffix">
                  <input
                    v-model="editedJob.equity_max"
                    type="number"
                    class="form-input"
                    :disabled="!isEditing"
                    placeholder="Max equity"
                    min="0"
                    step="0.1"
                  />
                  <span class="input-suffix">%</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Posted Date</label>
                <input
                  :value="formatDate(editedJob.posted)"
                  type="text"
                  class="form-input"
                  disabled
                />
              </div>
            </div>
          </div>

          <!-- Additional Fields -->
          <div class="form-section">
            <h3 class="section-title">Additional Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Opening</label>
                <input
                  v-model="editedJob.opening"
                  type="number"
                  class="form-input"
                  :disabled="!isEditing"
                  placeholder="Number of openings"
                  min="0"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Qualifications</label>
                <select
                  v-model="editedJob.qualification"
                  class="form-select"
                  :disabled="!isEditing"
                >
                  <option value="">Select qualification</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Phd">PhD</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Dialog -->
    <div v-if="deleteDialog" class="dialog-overlay" @click="deleteDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">Delete Job Posting</h3>
        </div>
        <div class="dialog-content">
          <p>Are you sure you want to delete this job posting? This action cannot be undone.</p>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="deleteDialog = false">Cancel</button>
          <button class="btn btn-danger" @click="deleteJob">Delete Job</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useJobsStore } from 'src/stores/appStore'

const props = defineProps({
  job: {
    type: Object,
    required: true,
  },
  goBack: {
    type: Function,
    required: true,
  },
})

const $q = useQuasar()
const deleteDialog = ref(false)
const jobToDelete = ref(null)
const jobsStore = useJobsStore()
const isEditing = ref(false)

const editedJob = reactive({ ...props.job })

watch(
  () => props.job,
  (newJob) => {
    Object.assign(editedJob, newJob)
  },
)

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  Object.assign(editedJob, props.job)
  isEditing.value = false
}

const saveChanges = async () => {
  try {
    const res = await fetch(`http://localhost:3000/jobs/edit-job`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...editedJob }),
    })

    const responseJSON = await res.json()
    if (!res.ok) {
      notify(responseJSON.message, 'negative')
    } else {
      notify('Job updated successfully!', 'positive')
      Object.assign(props.job, editedJob)
    }
  } catch (error) {
    console.error('Error occurred while updating job:', error)
    notify('Error occurred while updating job', 'negative')
  }
  isEditing.value = false
}

const confirmDeleteJob = (job) => {
  jobToDelete.value = job
  deleteDialog.value = true
}

const deleteJob = async () => {
  try {
    await jobsStore.deleteJob(jobToDelete.value.jobid)
    notify('Job deleted successfully', 'positive')
    deleteDialog.value = false
    jobToDelete.value = null
    props.goBack()
  } catch (error) {
    console.error('Error deleting job:', error)
    notify('Failed to delete job', 'negative')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const notify = (msg, color = 'primary') => {
  $q.notify({
    message: msg,
    color,
    position: 'bottom',
    timeout: 3000,
  })
}
</script>

<style scoped>
.job-details-container {
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
}

.job-details-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e5e5e5;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f5f5f5;
  border-color: #d4d4d4;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #171717;
}

.page-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #737373;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: #171717;
  color: white;
  border-color: #171717;
}

.btn-primary:hover {
  background: #404040;
  border-color: #404040;
}

.btn-secondary {
  background: white;
  color: #171717;
  border-color: #e5e5e5;
}

.btn-secondary:hover {
  background: #f5f5f5;
  border-color: #d4d4d4;
}

.btn-danger {
  background: white;
  color: #dc2626;
  border-color: #e5e5e5;
}

.btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

/* Content */
.card-content {
  padding: 24px;
}

.job-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #171717;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #171717;
}

.form-input,
.form-textarea,
.form-select {
  margin-top: 5px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  color: #171717;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #171717;
  box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.1);
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background: #f9f9f9;
  color: #737373;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.input-with-prefix,
.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 12px;
  font-size: 14px;
  color: #737373;
  z-index: 1;
}

.input-with-prefix .form-input {
  padding-left: 32px;
}

.input-suffix {
  position: absolute;
  right: 12px;
  font-size: 14px;
  color: #737373;
  z-index: 1;
}

.input-with-suffix .form-input {
  padding-right: 50px;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
}

.dialog-header {
  padding: 20px 20px 0 20px;
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #171717;
}

.dialog-content {
  padding: 16px 20px;
}

.dialog-content p {
  margin: 0;
  color: #737373;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f5f5f5;
}

/* Responsive */
@media (max-width: 768px) {
  .job-details-container {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .edit-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
