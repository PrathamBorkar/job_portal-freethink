import { defineStore } from "pinia";

export const useJobsStore = defineStore("jobs", {
  state: () => ({
    jobs: [
      {
        id: 1,
        title: "Senior Vue.js Developer",
        company: "Acme Technologies",
        jobType: "Full-time",
        modeOfWork: "Hybrid",
        experienceRequired: "3-5 years",
        salary: "₹8L - ₹15L",
        location: "Bangalore, India",
        description: `We are looking for an experienced Vue.js developer to join our dynamic team. The ideal candidate will have strong experience in building modern web applications using Vue.js, Vuex/Pinia, and related technologies.

Key Responsibilities:
• Develop and maintain Vue.js applications
• Collaborate with design and backend teams
• Write clean, maintainable code
• Participate in code reviews and technical discussions

Requirements:
• 3+ years of Vue.js experience
• Strong JavaScript/TypeScript skills
• Experience with state management (Vuex/Pinia)
• Knowledge of modern build tools (Vite, Webpack)`,
        skills: [
          "Vue.js",
          "JavaScript",
          "TypeScript",
          "HTML",
          "CSS",
          "REST APIs",
        ],
        postedAt: "2024-01-15",
        status: "published",
        applicants: [
          {
            id: 1,
            name: "Alice Johnson",
            email: "alice.johnson@email.com",
            phone: "+91-9876543210",
            avatar: "https://randomuser.me/api/portraits/women/1.jpg",
            resumeUrl: "https://example.com/resume1.pdf",
            status: "pending",
            experience: "4 years in frontend development",
            skills: ["Vue.js", "React", "JavaScript", "TypeScript", "CSS"],
            appliedAt: "2024-01-16T10:30:00Z",
          },
          {
            id: 2,
            name: "Robert Chen",
            email: "robert.chen@email.com",
            phone: "+91-9876543211",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            resumeUrl: "https://example.com/resume2.pdf",
            status: "accepted",
            experience: "5 years full-stack development",
            skills: ["Vue.js", "Node.js", "MongoDB", "Express", "AWS"],
            appliedAt: "2024-01-17T14:20:00Z",
          },
          {
            id: 3,
            name: "Sarah Williams",
            email: "sarah.williams@email.com",
            phone: "+91-9876543212",
            avatar: "https://randomuser.me/api/portraits/women/3.jpg",
            resumeUrl: "https://example.com/resume3.pdf",
            status: "rejected",
            experience: "2 years in web development",
            skills: ["Vue.js", "JavaScript", "HTML", "CSS", "Git"],
            appliedAt: "2024-01-18T09:15:00Z",
          },
          {
            id: 4,
            name: "Michael Brown",
            email: "michael.brown@email.com",
            phone: "+91-9876543213",
            avatar: "https://randomuser.me/api/portraits/men/4.jpg",
            resumeUrl: "https://example.com/resume4.pdf",
            status: "pending",
            experience: "3 years Vue.js specialist",
            skills: ["Vue.js", "Vuex", "JavaScript", "TypeScript", "Jest"],
            appliedAt: "2024-01-19T16:45:00Z",
          },
        ],
      },
    ],
    drafts: [], // ✅ Added missing drafts array
    jobCategories: [
      "Information Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Manufacturing",
      "Retail",
      "Construction",
      "Transportation",
      "Hospitality",
      "Real Estate",
      "Telecommunications",
      "Marketing",
      "Sales",
      "Design",
      "Other",
    ],
    popularSkills: [
      "Vue.js",
      "React",
      "Angular",
      "JavaScript",
      "TypeScript",
      "HTML",
      "CSS",
      "Node.js",
      "Express",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "AWS",
      "Docker",
      "Kubernetes",
      "Python",
      "Java",
      "C#",
      "PHP",
      "Ruby",
      "Figma",
      "Sketch",
      "Adobe XD",
      "Photoshop",
      "Illustrator",
      "Git",
      "REST APIs",
      "GraphQL",
      "Redux",
      "Vuex",
      "Jest",
      "Cypress",
      "Selenium",
      "Jenkins",
      "CI/CD",
    ],
    filters: {
      jobType: "",
      modeOfWork: "",
      experienceLevel: "",
      location: "",
      skills: [],
      salaryRange: { min: 0, max: 50 },
    },
  }),

  getters: {
    getJobsByCompany: (state) => (companyName) => {
      return state.jobs.filter((job) => job.company === companyName);
    },

    getPublishedJobs: (state) => {
      return state.jobs.filter((job) => job.status === "published");
    },

    getJobsByRecruiter: (state) => (recruiterName) => {
      return state.jobs.filter((job) => job.company === recruiterName);
    },

    getJobById: (state) => (jobId) => {
      return (
        state.jobs.find((job) => job.id === jobId) ||
        state.drafts.find((draft) => draft.id === jobId)
      );
    },

    getApplicantsByJobId: (state) => (jobId) => {
      const job = state.jobs.find((job) => job.id === jobId);
      return job ? job.applicants || [] : [];
    },

    getApplicantsByStatus: (state) => (jobId, status) => {
      const job = state.jobs.find((job) => job.id === jobId);
      return job?.applicants?.filter((app) => app.status === status) || [];
    },

    getTotalApplicantsCount: (state) => (jobId) => {
      const job = state.jobs.find((job) => job.id === jobId);
      return job?.applicants?.length || 0;
    },

    getFilteredJobs: (state) => {
      let filteredJobs = state.jobs.filter((job) => job.status === "published");

      const {
        jobType,
        modeOfWork,
        experienceLevel,
        location,
        skills,
        salaryRange,
      } = state.filters;

      if (jobType) {
        filteredJobs = filteredJobs.filter((job) => job.jobType === jobType);
      }

      if (modeOfWork) {
        filteredJobs = filteredJobs.filter(
          (job) => job.modeOfWork === modeOfWork
        );
      }

      if (experienceLevel) {
        filteredJobs = filteredJobs.filter(
          (job) => job.experienceRequired === experienceLevel
        );
      }

      if (location) {
        filteredJobs = filteredJobs.filter((job) =>
          job.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      if (skills.length > 0) {
        filteredJobs = filteredJobs.filter((job) =>
          skills.some((skill) => job.skills.includes(skill))
        );
      }

      if (salaryRange) {
        filteredJobs = filteredJobs.filter((job) => {
          const match = job.salary.match(/₹?(\d+)L\s*-\s*₹?(\d+)L/);
          if (!match) return true;
          const min = parseInt(match[1]);
          const max = parseInt(match[2]);
          return min <= salaryRange.max && max >= salaryRange.min;
        });
      }

      return filteredJobs;
    },

    getJobStats: (state) => (companyName) => {
      const companyJobs = state.jobs.filter(
        (job) => job.company === companyName
      );
      return {
        totalJobs: companyJobs.length,
        totalApplicants: companyJobs.reduce(
          (total, job) => total + (job.applicants?.length || 0),
          0
        ),
        pendingApplicants: companyJobs.reduce(
          (total, job) =>
            total +
            (job.applicants?.filter((app) => app.status === "pending").length ||
              0),
          0
        ),
        acceptedApplicants: companyJobs.reduce(
          (total, job) =>
            total +
            (job.applicants?.filter((app) => app.status === "accepted")
              .length || 0),
          0
        ),
        rejectedApplicants: companyJobs.reduce(
          (total, job) =>
            total +
            (job.applicants?.filter((app) => app.status === "rejected")
              .length || 0),
          0
        ),
      };
    },
  },

  actions: {
    addJob(jobData) {
      const newJob = {
        ...jobData,
        id:
          this.jobs.length > 0
            ? Math.max(...this.jobs.map((j) => +j.id || 0)) + 1
            : 1,
        applicants: [],
        postedAt: new Date().toISOString().split("T")[0],
        status: "published",
      };
      this.jobs.unshift(newJob);
      return newJob;
    },

    addDraft(jobData) {
      const newDraft = {
        ...jobData,
        id: `draft_${Date.now()}`,
        applicants: [],
        postedAt: new Date().toISOString().split("T")[0],
        status: "draft",
      };
      this.drafts.unshift(newDraft);
      return newDraft;
    },

    publishDraft(draftId) {
      const draftIndex = this.drafts.findIndex((draft) => draft.id === draftId);
      if (draftIndex !== -1) {
        const draft = this.drafts[draftIndex];
        const publishedJob = {
          ...draft,
          id:
            this.jobs.length > 0
              ? Math.max(...this.jobs.map((j) => +j.id || 0)) + 1
              : 1,
          status: "published",
        };
        this.jobs.unshift(publishedJob);
        this.drafts.splice(draftIndex, 1);
        return publishedJob;
      }
      return null;
    },

    updateJob(jobId, updates) {
      const index = this.jobs.findIndex((job) => job.id === jobId);
      if (index !== -1) {
        this.jobs[index] = { ...this.jobs[index], ...updates };
        return this.jobs[index];
      }
      return null;
    },

    deleteJob(jobId) {
      const index = this.jobs.findIndex((job) => job.id === jobId);
      if (index !== -1) {
        this.jobs.splice(index, 1);
        return true;
      }
      return false;
    },

    deleteDraft(draftId) {
      const index = this.drafts.findIndex((draft) => draft.id === draftId);
      if (index !== -1) {
        this.drafts.splice(index, 1);
        return true;
      }
      return false;
    },

    addApplicant(jobId, applicantData) {
      const job = this.jobs.find((job) => job.id === jobId);
      if (job) {
        const newApplicant = {
          ...applicantData,
          id:
            job.applicants.length > 0
              ? Math.max(...job.applicants.map((a) => a.id)) + 1
              : 1,
          status: "pending",
          appliedAt: new Date().toISOString(),
        };
        job.applicants.push(newApplicant);
        return newApplicant;
      }
      return null;
    },

    updateApplicantStatus(jobId, applicantId, newStatus) {
      const job = this.jobs.find((job) => job.id === jobId);
      const applicant = job?.applicants?.find((app) => app.id === applicantId);
      if (applicant) {
        applicant.status = newStatus;
        applicant.updatedAt = new Date().toISOString();
        return applicant;
      }
      return null;
    },

    updateApplicant(jobId, applicantId, updates) {
      const job = this.jobs.find((job) => job.id === jobId);
      const index = job?.applicants?.findIndex((app) => app.id === applicantId);
      if (index !== -1 && job) {
        job.applicants[index] = {
          ...job.applicants[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return job.applicants[index];
      }
      return null;
    },

    removeApplicant(jobId, applicantId) {
      const job = this.jobs.find((job) => job.id === jobId);
      const index = job?.applicants?.findIndex((app) => app.id === applicantId);
      if (index !== -1 && job) {
        job.applicants.splice(index, 1);
        return true;
      }
      return false;
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters() {
      this.filters = {
        jobType: "",
        modeOfWork: "",
        experienceLevel: "",
        location: "",
        skills: [],
        salaryRange: { min: 0, max: 50 },
      };
    },

    searchJobs(searchTerm) {
      if (!searchTerm.trim()) return this.getPublishedJobs;

      const term = searchTerm.toLowerCase();
      return this.jobs.filter(
        (job) =>
          job.status === "published" &&
          (job.title.toLowerCase().includes(term) ||
            job.company.toLowerCase().includes(term) ||
            job.description.toLowerCase().includes(term) ||
            job.location.toLowerCase().includes(term) ||
            job.skills.some((skill) => skill.toLowerCase().includes(term)))
      );
    },

    bulkUpdateApplicantStatus(jobId, applicantIds, newStatus) {
      const job = this.jobs.find((job) => job.id === jobId);
      if (job?.applicants) {
        applicantIds.forEach((id) => {
          const applicant = job.applicants.find((app) => app.id === id);
          if (applicant) {
            applicant.status = newStatus;
            applicant.updatedAt = new Date().toISOString();
          }
        });
        return true;
      }
      return false;
    },

    getJobAnalytics(jobId) {
      const job = this.jobs.find((job) => job.id === jobId);
      if (!job || !job.applicants) return null;

      const total = job.applicants.length;
      const counts = job.applicants.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});

      return {
        jobTitle: job.title,
        totalApplicants: total,
        pending: counts.pending || 0,
        accepted: counts.accepted || 0,
        rejected: counts.rejected || 0,
        acceptanceRate: total
          ? (((counts.accepted || 0) / total) * 100).toFixed(1)
          : 0,
        rejectionRate: total
          ? (((counts.rejected || 0) / total) * 100).toFixed(1)
          : 0,
      };
    },
  },
});
