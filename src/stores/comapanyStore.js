import { defineStore } from 'pinia'
import { useUserStore } from './user-store'
const baseUrl = 'http://localhost:3000'

export const useCompanyStore = defineStore('company', {
  state: () => ({
    company: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasCompany: (state) => !!state.company,
    companyName: (state) => state.company?.name || '',
    companyEmail: (state) => state.company?.email || '',
    isLoading: (state) => state.loading,
  },

  actions: {
    async fetchCompanyByRecruiter() {
      console.log('=== fetchCompanyByRecruiter called ===')
      const userStore = useUserStore()
      const token = userStore.token || sessionStorage.getItem('token')

      if (!token) {
        this.error = 'No authentication token found'
        this.company = null
        return
      }

      this.loading = true
      this.error = null

      try {
        console.log('Making request to:', `${baseUrl}/company/getCompanyByRecruiter`)
        console.log('Token:', token.substring(0, 20) + '...')

        const res = await fetch(`${baseUrl}/company/getCompanyByRecruiter`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('Response status:', res.status)
        console.log('Response headers:', Object.fromEntries(res.headers.entries()))

        // Check if response is JSON
        const contentType = res.headers.get('content-type')
        console.log('Content-Type:', contentType)

        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await res.text()
          console.error('Non-JSON response:', responseText)
          throw new Error(
            'Server returned non-JSON response. Please check if the backend server is running and the endpoint exists.',
          )
        }

        if (!res.ok) {
          const errorData = await res.json()
          console.error('Error response:', errorData)
          throw new Error(errorData.message || `HTTP ${res.status}: Failed to fetch company`)
        }

        const data = await res.json()
        console.log('Success response:', data)

        // Handle the response structure from your backend
        this.company = data.company || data

        // Ensure locations is properly formatted
        if (this.company && this.company.locations) {
          if (typeof this.company.locations === 'string') {
            this.company.locations = this.company.locations
              .split(',')
              .map((loc) => loc.trim())
              .filter((loc) => loc)
          } else if (!Array.isArray(this.company.locations)) {
            this.company.locations = []
          }
        } else if (this.company) {
          this.company.locations = []
        }

        this.error = null
        return this.company
      } catch (err) {
        this.error = err.message
        this.company = null
        console.error('fetchCompanyByRecruiter error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateCompany(companyData) {
      const userStore = useUserStore()
      const token = userStore.token || sessionStorage.getItem('token')

      if (!token) {
        this.error = 'No authentication token found'
        return false
      }

      this.loading = true
      this.error = null

      try {
        console.log('Updating company with data:', companyData)

        const res = await fetch(`${baseUrl}/company/updateCompany`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(companyData),
        })

        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await res.text()
          console.error('Non-JSON response:', responseText)
          throw new Error(
            'Server returned non-JSON response. Please check if the backend server is running and the endpoint exists.',
          )
        }

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || `HTTP ${res.status}: Failed to update company`)
        }

        const data = await res.json()
        console.log('Update response:', data)

        // Update the store with the response
        this.company = data.company || data

        // Ensure locations is properly formatted
        if (this.company && this.company.locations) {
          if (typeof this.company.locations === 'string') {
            this.company.locations = this.company.locations
              .split(',')
              .map((loc) => loc.trim())
              .filter((loc) => loc)
          } else if (!Array.isArray(this.company.locations)) {
            this.company.locations = []
          }
        }

        this.error = null
        return true
      } catch (err) {
        this.error = err.message
        console.error('updateCompany error:', err)
        return false
      } finally {
        this.loading = false
      }
    },

    // Helper method to clear company data (useful for logout)
    clearCompany() {
      this.company = null
      this.error = null
      this.loading = false
    },

    // Helper method to set company data directly (useful for testing)
    setCompany(companyData) {
      this.company = companyData
      this.error = null
    },
  },
})
