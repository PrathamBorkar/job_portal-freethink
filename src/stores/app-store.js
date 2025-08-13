import { defineStore } from "pinia";
import { useUserStore } from "./user-store";

const baseUrl = "http://localhost:3000/application"; // Base URL for job-related API endpoints

export const useAppStore = defineStore("app", {
  state: () => ({
    applications: [],
    currentApplication: null,
    education: [],
    experience: [],
    loading: false,
    error: null,
  }),

  actions: {
    // Get application by job ID
    async getApplication(jobId) {
      this.loading = true;
      this.error = null;

      try {
        const userStore = useUserStore();
        const token = userStore.token || sessionStorage.getItem("token");

        const response = await fetch(`${baseUrl}/applications/${jobId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        this.currentApplication = data;
        return data;
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching application:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Get experience by user ID
    // Add these methods to your Pinia store (src/stores/app-store.js)

    // Get education details for a specific user
    async getEducation(uid) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${baseUrl}/education/${uid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${this.token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        this.education = data;
        return data;
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching education:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Get experience details for a specific user
    async getExperience(uid) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${baseUrl}/experience/${uid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${this.token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        this.experience = data;
        return data;
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching experience:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Update application status (this will also send email automatically)
    async updateStatus(statusData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${baseUrl}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: statusData.uid,
            status: statusData.status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Update current application if it matches
        if (
          this.currentApplication &&
          this.currentApplication.uid === statusData.uid
        ) {
          this.currentApplication.status = statusData.status;
        }

        return data;
      } catch (error) {
        this.error = error.message;
        console.error("Error updating status:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Send custom email (if you need this separate from status update)
    async sendEmail(emailData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${baseUrl}/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: emailData.uid,
            status: emailData.status, // For the sendmail endpoint
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        this.error = error.message;
        console.error("Error sending email:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Clear error
    clearError() {
      this.error = null;
    },

    // Reset store
    resetStore() {
      this.applications = [];
      this.currentApplication = null;
      this.education = [];
      this.experience = [];
      this.loading = false;
      this.error = null;
    },
  },

  getters: {
    // Check if currently loading
    isLoading: (state) => state.loading,

    // Check if there's an error
    hasError: (state) => !!state.error,

    // Get current application status
    currentStatus: (state) => state.currentApplication?.status,

    // Get education count
    educationCount: (state) => state.education.length,

    // Get experience count
    experienceCount: (state) => state.experience.length,
  },
});
