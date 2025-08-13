<template>
  <div class="bottom-section row q-mt-sm">
    <!-- LEFT SIDE -->
    <div class="left-side">
      <q-card class="resume-links-card widget">
        <!-- Header -->
        <div class="form-header">
          <div>Resume & Online Profiles</div>
        </div>

        <!-- Resume Upload -->
        <div class="section-title">Upload Resume</div>
        <div class="upload-section q-mb-md">
          <q-uploader
            url=""
            label="Click or drag file here to upload"
            color="primary"
            square
            bordered
            flat
            class="full-width"
            style="height: 180px"
            no-thumbnails
            :auto-upload="false"
            @added="onResumeAdded"
          />
          <div v-if="resumeName" class="text-subtitle2 q-mt-sm">
            Selected File: {{ resumeName }}
          </div>
        </div>

        <!-- Online Profiles -->
        <div class="section-title">Add Online Profiles</div>
        <div class="profile-grid">
          <q-input v-model="links.linkedin" label="LinkedIn URL" outlined dense />
          <q-input v-model="links.github" label="GitHub URL" outlined dense />
          <q-input v-model="links.portfolio" label="Portfolio Website" outlined dense />
          <q-input v-model="links.website" label="Personal Website" outlined dense />
          <q-input
            v-model="links.codingProfile"
            label="Competitive Coding Profile"
            outlined
            dense
          />
          <q-input v-model="links.other" label="Other Profile Link" outlined dense />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomThree',
  data() {
    return {
      resumeName: null,
      links: {
        linkedin: '',
        github: '',
        portfolio: '',
        website: '',
        codingProfile: '',
        other: '',
      },
    }
  },
  methods: {
    onResumeAdded(files) {
      if (files && files.length > 0) {
        this.resumeName = files[0].name
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

.form-header {
  font-weight: 600;
  font-size: 18px;
  color: #212121;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #212121;
  margin-top: 24px;
  margin-bottom: 12px;
}

.upload-section {
  margin-bottom: 24px;
}

.q-uploader {
  border-radius: 8px;
  border: 1px dashed #e0e0e0;
}

.q-uploader :deep(.q-uploader__header) {
  background: #fafafa;
  border-radius: 8px 8px 0 0;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.q-input :deep(.q-field__control) {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
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
