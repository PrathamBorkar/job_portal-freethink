import { defineStore } from 'pinia'
const baseUrl = 'http://localhost:3000'

export const useUserStore = defineStore('user', {
  state: () => ({
    uid: null,
    name: null,
    email: null,
    role: null,
    phone: null,

    gender: null,
    dob: null,
    employmentStatus: null,
    jobType: null,
    preferredLocation: null,
    availability: null,
    linkedIn: null,
    portfolioWebsite: null,

    token: null,

    degree: null,
    institution: null,
    field_of_study: null,
    start_date_degree: null,
    end_date_degree: null,
    grade_value: null,
    grade_type: null,
    education_level: null,

    expName: null,
    expRole: null,
    expStart: null,
    expEnd: null,

    skills: [],

    company: null,
  }),

  actions: {
    setEverythingToNull() {
      this.uid = null
      this.name = null
      this.phone = null
      this.email = null
      this.role = null

      this.gender = null
      this.dob = null
      this.employmentStatus = null
      this.jobType = null
      this.preferredLocation = null
      this.availability = null
      this.linkedin = null
      this.portfolioWebsite = null

      this.token = null

      this.degree = null
      this.institution = null
      this.field_of_study = null
      this.start_date_degree = null
      this.end_date_degree = null
      this.gradeValue = null
      this.gradeType = null
      this.education_level = null

      this.expName = null
      this.expRole = null
      this.expStart = null
      this.expEnd = null

      this.skills = []

      this.companyName = null
    },

    async login({ email, password }) {
      try {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const responseJson = await res.json()

        if (!res.ok) {
          return {
            success: false,
            message: responseJson.message || 'Login failed',
          }
        }

        this.uid = responseJson.user?.uid
        this.name = responseJson.user?.name
        this.phone = responseJson.user?.phone
        this.role = responseJson.user?.role
        this.email = responseJson.user?.email
        this.token = responseJson.token

        if (this.role === 'recruiter') {
          this.company = responseJson.user?.company
        } else {
          this.gender = responseJson.user?.gender
          this.dob = responseJson.user?.dob ? responseJson.user.dob.split('T')[0] : null
          this.employmentStatus = responseJson.user?.employmentStatus
          this.jobType = responseJson.user?.jobType
          this.preferredLocation = responseJson.user?.preferredLocation
          this.availability = responseJson.user?.availability
          this.linkedIn = responseJson.user?.linkedIn
          this.portfolioWebsite = responseJson.user?.portfolioWebsite

          this.degree = responseJson.user?.degree
          this.institution = responseJson.user?.institution
          this.field_of_study = responseJson.user?.field_of_study
          this.start_date_degree = responseJson.user?.start_date_degree
            ? responseJson.user.start_date_degree.split('T')[0]
            : null
          this.end_date_degree = responseJson.user?.end_date_degree
            ? responseJson.user.end_date_degree.split('T')[0]
            : null
          this.grade_value = responseJson.user?.gradeValue
          this.grade_type = responseJson.user?.gradeType
          this.education_level = responseJson.user?.education_level

          this.expName = responseJson.user?.expName
          this.expRole = responseJson.user?.expRole
          this.expStart = responseJson.user?.expStart
          this.expEnd = responseJson.user?.expEnd

          const skillids = responseJson.user?.skillids || []
          this.skills = []

          for (const skillid of skillids) {
            try {
              const response = await fetch(`${baseUrl}/skills/${skillid}`)
              const skillName = await response.json()
              if (skillName?.name) {
                this.skills.push([skillid, skillName.name])
              }
            } catch (err) {
              console.warn(`Failed to fetch skill ${skillid}:`, err)
            }
          }
        }

        return {
          success: true,
          message: responseJson.message || 'Login successful',
        }
      } catch (error) {
        console.warn('Login error:', error)
        return {
          success: false,
          message: 'Network error or server unavailable',
        }
      }
    },

    async sendOTP(email) {
      try {
        const res = await fetch(`${baseUrl}/auth/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email }),
        })

        const responseJson = await res.json()

        if (!res.ok) {
          return {
            success: false,
            message: responseJson.message || 'Failed to send OTP',
          }
        }

        return {
          success: true,
          message: responseJson.message || 'OTP sent successfully',
        }
      } catch (error) {
        console.error('Error sending OTP:', error)
        return {
          success: false,
          message: 'Something went wrong while sending OTP',
        }
      }
    },

    async verifyOTP(email, otp) {
      try {
        const res = await fetch(`${baseUrl}/auth/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email, otp: otp }),
        })

        const responseData = await res.json()

        if (!res.ok) {
          return {
            success: false,
            message: responseData.message || 'OTP verification failed',
          }
        }

        if (!responseData.success) {
          return {
            success: false,
            message: responseData.message || 'OTP verification failed',
          }
        }

        return {
          success: true,
          message: responseData.message || 'OTP verified successfully',
        }
      } catch (error) {
        console.error('Error verifying OTP:', error)
        return {
          success: false,
          message: error.message || 'Network error during OTP verification',
        }
      }
    },

    async register(data) {
      this.setEverythingToNull()
      try {
        const response = await fetch(`${baseUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        const res = await response.json()

        if (!response.ok) {
          if (res.message && res.message.includes('Duplicate entry')) {
            return {
              success: false,
              message: 'Email already exists. Please use a different email.',
            }
          }
          return {
            success: false,
            message: res.message || 'Registration failed',
          }
        }

        if (res.success) {
          this.uid = res.user.uid
          this.name = res.user.name
          this.email = res.user.email
          this.phone = res.user.phone
          this.role = res.user.role
          this.token = res.token

          if (this.role == 'applicant') {
            this.degree = res.user?.education.degree
            this.institution = res.user?.education.institution
            this.field_of_study = res.user?.education.field_of_study
            this.start_date_degree = res.user?.education.start_date_degree.split('T')[0]
            this.end_date_degree = res.user?.education.end_date_degree.split('T')[0]
            this.grade_value = res.user?.education.grade_value
            this.grade_type = res.user?.education.grade_type
            this.education_level = res.user?.education.education_level

            this.expName = res.user?.experience.expName
            this.expRole = res.user?.experience.role
            this.expStart = res.user?.experience.start
            this.expEnd = res.user?.experience.end

            const skillids = res.user?.skillids || []

            for (const skillid of skillids) {
              const response = await fetch(`${baseUrl}/skills/${skillid}`)
              const skillName = await response.json()
              this.skills.push([skillid, skillName.name])
            }
          } else {
            this.company = res.user?.company
          }

          return {
            success: true,
            message: res.message || 'Registration successful',
          }
        }

        return {
          success: false,
          message: res.message || 'Registration failed',
        }
      } catch (error) {
        console.error('Error during registration:', error)
        return {
          success: false,
          message: error.message || 'Network error during registration',
        }
      }
    },

    async updateAdditionalData(tempData) {
      const payload = { ...tempData, uid: this.uid }

      try {
        const response = await fetch(`${baseUrl}/edit-profile/additional-details`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ additionalData: payload }),
        })

        if (response.ok) {
          this.gender = tempData.gender
          this.dob = tempData.dob.split('T')[0]
          this.employmentStatus = tempData.employmentStatus
          this.jobType = tempData.jobType
          this.preferredLocation = tempData.preferredLocation
          this.availability = tempData.availability
          this.linkedIn = tempData.linkedIn
          this.portfolioWebsite = tempData.portfolioWebsite
        }
      } catch (err) {
        console.log(err)
      }
    },

    async updateEducation(tempData) {
      const payload = { ...tempData, uid: this.uid }

      try {
        const response = await fetch(`${baseUrl}/edit-profile/education`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ educationalData: payload }),
        })

        if (response.ok) {
          this.degree = tempData.degree
          this.institution = tempData.institution
          this.field_of_study = tempData.field_of_study
          this.start_date_degree = tempData.start_date_degree
          this.end_date_degree = tempData.end_date_degree
          this.grade_value = tempData.grade_value
          this.grade_type = tempData.grade_type
          this.education_level = tempData.education_level
        }
      } catch (err) {
        console.log(err)
      }
    },

    async updateSkills(updatedSkills) {
      const payload = { skills: updatedSkills, uid: this.uid }

      try {
        const response = await fetch(`${baseUrl}/edit-profile/skills`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ skillData: payload }),
        })

        if (response.ok) {
          this.skills = updatedSkills
        }
      } catch (err) {
        console.log(err)
      }
    },

    async updateRecruiter(editData) {
      try {
        const response = await fetch(`${baseUrl}/edit-profile/recruiter`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ editData }),
        })

        if (response.ok) {
          this.company = editData
          return { message: 'success' }
        }
      } catch (err) {
        console.log(err)
        return { message: 'failed' }
      }
    },
    async applyForJob(jobid) {
      console.log('[UserStore] applyForJob called with jobid:', jobid) // <-- Log here

      const payload = {
        uid: this.uid,
        jobid,
      }

      try {
        const response = await fetch(`${baseUrl}/application/apply`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationData: payload }),
        })

        if (!response.ok) {
          const resJson = await response.json()
          return {
            success: false,
            message: resJson.message || 'Failed to apply for job',
          }
        }

        return {
          success: true,
          message: 'Applied for job successfully',
        }
      } catch (error) {
        console.error('Error applying for job:', error)
        return {
          success: false,
          message: 'Network error or server unavailable',
        }
      }
    },
  },
})
