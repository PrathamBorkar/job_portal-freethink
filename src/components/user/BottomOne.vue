<template>
  <div class="bottom-section row q-mt-sm">
    <!-- LEFT SIDE -->
    <div class="left-side">
      <q-card class="education-info-form widget">
        <!-- Header -->
        <div class="form-header">
          <div>Additional Details</div>
          <div v-if="!isEditable">
            <q-btn dense flat round icon="edit" size="sm" @click="toggleEdit" />
          </div>
          <div v-else class="row no-wrap items-center">
            <q-btn dense flat round icon="check" size="sm" color="positive" @click="saveEdit" />
            <q-btn dense flat round icon="close" size="sm" color="negative" @click="cancelEdit" />
          </div>
        </div>

        <!-- PERSONAL INFO -->
        <div class="section-title">Personal Information</div>
        <div class="edu-entry">
          <div class="edu-left">
            <q-select
              v-model="tempData.gender"
              :disable="!isEditable"
              :options="['Male', 'Female', 'Other']"
              dense
              flat
              filled
              class="no-border"
              label="Gender"
            />
            <q-input
              v-model="tempData.dob"
              :disable="!isEditable"
              dense
              flat
              filled
              class="no-border"
              label="Date of Birth"
              type="date"
            />
          </div>
        </div>

        <!-- PROFESSIONAL INFO -->
        <div class="section-title">Professional Details</div>
        <div class="edu-entry">
          <div class="edu-left">
            <q-input
              v-model="tempData.experience"
              :disable="!isEditable"
              dense
              flat
              filled
              class="no-border"
              label="Work Experience (in years)"
              type="number"
            />
            <q-select
              v-model="tempData.employmentStatus"
              :disable="!isEditable"
              :options="['Employed', 'Unemployed', 'Fresher']"
              dense
              flat
              filled
              class="no-border"
              label="Employment Status"
            />
          </div>
        </div>

        <!-- JOB PREFERENCE -->
        <div class="section-title">Job Preferences</div>
        <div class="edu-entry">
          <div class="edu-left">
            <q-select
              v-model="tempData.jobType"
              :disable="!isEditable"
              :options="['Full-time', 'Part-time', 'Internship']"
              dense
              flat
              filled
              class="no-border"
              label="Preferred Job Type"
            />
            <q-input
              v-model="tempData.preferredLocation"
              :disable="!isEditable"
              dense
              flat
              filled
              class="no-border"
              label="Preferred Job Location"
            />
          </div>
        </div>

        <!-- AVAILABILITY -->
        <div class="edu-entry">
          <q-option-group
            v-model="tempData.availability"
            :disable="!isEditable"
            inline
            :options="[
              { label: 'Remote', value: 'Remote' },
              { label: 'Onsite', value: 'Onsite' },
              { label: 'Hybrid', value: 'Hybrid' },
            ]"
            type="checkbox"
            label="Availability"
          />
        </div>

        <!-- LANGUAGE -->
        <div class="edu-entry">
          <q-input
            v-model="tempData.languages"
            :disable="!isEditable"
            dense
            flat
            filled
            class="no-border"
            label="Languages Known (comma separated)"
          />
        </div>

        <!-- HEADLINE -->
        <div class="edu-entry">
          <q-input
            v-model="tempData.resumeHeadline"
            :disable="!isEditable"
            dense
            flat
            filled
            class="no-border"
            label="Resume Headline"
          />
        </div>

        <!-- LINKS -->
        <div class="section-title">Links</div>
        <div class="edu-entry">
          <div class="edu-left">
            <q-input
              v-model="tempData.linkedin"
              :disable="!isEditable"
              dense
              flat
              filled
              class="no-border"
              label="LinkedIn Profile URL"
            />
            <q-input
              v-model="tempData.portfolio"
              :disable="!isEditable"
              dense
              flat
              filled
              class="no-border"
              label="Portfolio Website (if any)"
            />
          </div>
        </div>
      </q-card>
    </div>

    <!-- RIGHT SIDE -->
    <div class="right-side column q-ml-sm">
      <!-- Education Info -->
      <q-card class="education-info-form widget">
        <!-- Header -->
        <div class="form-header">
          <div>Education</div>
          <div v-if="!isEditableEdu">
            <q-btn dense flat round icon="edit" size="sm" @click="toggleEditEdu" />
          </div>
          <div v-else class="row no-wrap items-center">
            <q-btn dense flat round icon="check" size="sm" color="positive" @click="saveEditEdu" />
            <q-btn
              dense
              flat
              round
              icon="close"
              size="sm"
              color="negative"
              @click="cancelEditEdu"
            />
          </div>
        </div>

        <!-- College Name -->
        <div class="edu-entry">
          <div class="edu-left">
            <div class="edu-title">
              <q-input
                v-model="tempEduData.college"
                :disable="!isEditableEdu"
                dense
                flat
                filled
                class="no-border"
                label="College Name"
              />
            </div>
          </div>
        </div>

        <!-- Degree -->
        <div class="edu-entry">
          <div class="edu-left">
            <div class="edu-title">
              <q-input
                v-model="tempEduData.degree"
                :disable="!isEditableEdu"
                dense
                flat
                filled
                class="no-border"
                label="Qualification/Degree"
              />
            </div>
            <div class="edu-subtitle">
              <q-input
                v-model="tempEduData.degreeCgpa"
                :disable="!isEditableEdu"
                dense
                flat
                filled
                class="no-border"
                label="CGPA"
              />
            </div>
          </div>
        </div>

        <!-- Higher Secondary -->
        <div class="edu-entry">
          <div class="edu-left">
            <div class="edu-title">
              <q-input
                v-model="tempEduData.higherSecondary"
                :disable="!isEditableEdu"
                dense
                flat
                filled
                class="no-border"
                label="Higher Secondary School"
              />
            </div>
            <div class="edu-subtitle">
              <q-input
                v-model="tempEduData.higherCgpa"
                :disable="!isEditableEdu"
                dense
                flat
                filled
                class="no-border"
                label="CGPA"
              />
            </div>
          </div>
        </div>

        <!-- High School -->
        <div class="edu-entry">
          <div class="edu-left">
            <div class="edu-title">
              <q-input
                v-model="tempEduData.highSchool"
                :disable="!isEditableEdu"
                dense
                flat
                filled
                class="no-border"
                label="High School"
              />
            </div>
            <div class="edu-subtitle">
              <q-input
                v-model="tempEduData.highCgpa"
                :disable="!isEditableEdu"
                dense
                flat
                filled
                class="no-border"
                label="CGPA"
              />
            </div>
          </div>
        </div>

        <!-- Certifications -->
        <div class="cert-section">
          <div class="cert-header">Certifications</div>
          <div v-for="(cert, index) in tempEduData.certifications" :key="index" class="cert-entry">
            <q-input
              v-model="tempEduData.certifications[index]"
              :disable="!isEditableEdu"
              dense
              flat
              filled
              class="no-border"
              :label="'Certificate ' + (index + 1)"
            />
          </div>
        </div>
      </q-card>

      <!-- Skills Section -->
      <q-card class="skills-card widget">
        <!-- Header -->
        <div class="form-header">
          <div>Skills</div>
          <div>
            <q-btn
              v-if="!isEditableSkills"
              dense
              flat
              round
              icon="edit"
              size="sm"
              @click="toggleEditSkills"
            />
            <template v-else>
              <q-btn
                dense
                flat
                round
                icon="check"
                color="green"
                size="sm"
                class="q-mr-xs"
                @click="saveSkills"
              />
              <q-btn
                dense
                flat
                round
                icon="close"
                color="red"
                size="sm"
                @click="cancelEditSkills"
              />
            </template>
          </div>
        </div>

        <!-- Skills List -->
        <div class="skills-list">
          <q-chip
            v-for="(skill, index) in localSkills"
            :key="index"
            color="primary"
            text-color="white"
            class="q-mr-sm q-mb-sm"
            :removable="isEditableSkills"
            @remove="removeSkill(index)"
          >
            {{ skill }}
          </q-chip>
        </div>

        <!-- Add Skill Input -->
        <div v-if="isEditableSkills" class="add-skill-row">
          <q-input
            v-model="newSkill"
            dense
            filled
            placeholder="Add a skill"
            class="add-skill-input"
            @keyup.enter="addSkill"
          >
            <template v-slot:append>
              <q-btn icon="add" round dense flat @click="addSkill" :disable="!newSkill.trim()" />
            </template>
          </q-input>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomOne',
  data() {
    return {
      // User Section Data
      isEditable: false,
      additional: {
        gender: 'Male',
        dob: '2001-01-01',
        experience: '1',
        employmentStatus: 'Fresher',
        jobType: 'Internship',
        preferredLocation: 'Goa',
        availability: ['Remote'],
        languages: 'English, Hindi, Konkani',
        resumeHeadline: 'Frontend Developer | React.js | Vue.js',
        linkedin: 'https://linkedin.com/in/yourprofile',
        portfolio: 'https://yourportfolio.com',
      },
      tempData: {},

      // Education Section Data
      isEditableEdu: false,
      education: {
        college: 'Goa College of Engineering',
        degree: 'B.E. in Information Technology',
        degreeCgpa: '7.8',
        higherSecondary: 'ABC Higher Secondary School',
        higherCgpa: '8.5',
        highSchool: 'XYZ High School',
        highCgpa: '9.0',
        certifications: ['Full Stack Web Dev', 'Python Basics', 'UX Design'],
      },
      tempEduData: {},

      // Skills Section Data
      isEditableSkills: false,
      newSkill: '',
      skills: ['React', 'JavaScript', 'Figma', 'Teamwork', 'Communication'],
      localSkills: [],
    }
  },
  created() {
    this.localSkills = [...this.skills]
    this.tempData = { ...this.additional }
    this.tempEduData = { ...this.education }
  },
  methods: {
    // User Section Methods
    toggleEdit() {
      this.tempData = { ...this.additional }
      this.isEditable = true
    },
    saveEdit() {
      this.additional = { ...this.tempData }
      this.isEditable = false
    },
    cancelEdit() {
      this.tempData = { ...this.additional }
      this.isEditable = false
    },

    // Education Section Methods
    toggleEditEdu() {
      this.tempEduData = JSON.parse(JSON.stringify(this.education))
      this.isEditableEdu = true
    },
    saveEditEdu() {
      this.education = JSON.parse(JSON.stringify(this.tempEduData))
      this.isEditableEdu = false
    },
    cancelEditEdu() {
      this.isEditableEdu = false
    },

    // Skills Section Methods
    toggleEditSkills() {
      this.isEditableSkills = true
    },
    saveSkills() {
      this.skills = [...this.localSkills]
      this.isEditableSkills = false
    },
    cancelEditSkills() {
      this.localSkills = [...this.skills]
      this.isEditableSkills = false
    },
    addSkill() {
      const trimmed = this.newSkill.trim()
      if (trimmed && !this.localSkills.includes(trimmed)) {
        this.localSkills.push(trimmed)
        this.newSkill = ''
      }
    },
    removeSkill(index) {
      this.localSkills.splice(index, 1)
    },
  },
}
</script>

<style scoped>
.bottom-section {
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
  gap: 16px;
  flex-wrap: nowrap;
}

.left-side,
.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.widget {
  flex: 1;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  box-sizing: border-box;
}

.form-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 18px;
  color: #212121;
  margin-bottom: 16px;
  align-items: center;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #212121;
  margin-top: 24px;
  margin-bottom: 12px;
}

.edu-entry {
  margin-bottom: 16px;
}

.edu-left {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.no-border :deep(.q-field__control) {
  border: 1px solid #e0e0e0;
  background-color: #fafafa;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.no-border :deep(.q-field__control):hover {
  border-color: #bdbdbd;
}

.no-border :deep(.q-field--focused .q-field__control) {
  border-color: #212121;
  box-shadow: 0 0 0 2px rgba(33, 33, 33, 0.1);
}

.cert-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cert-header {
  font-weight: 600;
  font-size: 16px;
  color: #212121;
  margin-bottom: 8px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.q-chip {
  border-radius: 6px;
  background: #212121;
  color: white;
}

.add-skill-row {
  margin-top: 16px;
}

.add-skill-input :deep(.q-field__control) {
  border-radius: 8px;
}

@media (max-width: 900px) {
  .bottom-section {
    flex-direction: column;
  }

  .left-side .widget,
  .right-side .widget {
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
