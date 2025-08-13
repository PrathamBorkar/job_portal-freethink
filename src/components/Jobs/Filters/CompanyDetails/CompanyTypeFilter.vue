<template>
  <div class="company-types-wrapper" :class="{ 'active-filter': isActive }">
    <div class="company-types-container q-pa-md q-mb-md">
      <!-- Header: Title + Clear -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="company-types-title">Company Types</div>
        <div v-if="isActive" class="clear-text" @click="clearFilter">Clear</div>
      </div>

      <!-- Subtitle -->
      <div class="company-types-subtitle">
        {{
          selectedCompanyTypes.length
            ? selectedCompanyTypes.join(", ")
            : "Any Type"
        }}
      </div>

      <!-- Checkbox Grid -->
      <div class="row q-col-gutter-sm">
        <div v-for="option in pagedOptions" :key="option.value" class="col-6">
          <q-checkbox
            v-model="selectedCompanyTypes"
            :label="option.label"
            :val="option.value"
            color="primary"
          />
        </div>
      </div>

      <!-- Pagination Buttons -->
      <div class="row justify-center q-mt-md">
        <q-btn
          flat
          dense
          icon="chevron_left"
          @click="prevPage"
          :disable="currentPage === 0"
          class="q-mr-sm"
        />
        <q-btn
          flat
          dense
          icon="chevron_right"
          @click="nextPage"
          :disable="currentPage >= totalPages - 1"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useFilterStore } from "src/stores/filter-store";

export default {
  name: "CompanyTypeFilter",

  data() {
    return {
      currentPage: 0,
      pageSize: 6,
      companyTypeOptions: [
        { label: "Private", value: "Private" },
        { label: "Public", value: "Public" },
        { label: "Non-Profit", value: "Non-Profit" },
        { label: "Government", value: "Government" },
        { label: "Startup", value: "Startup" },
        { label: "Consulting", value: "Consulting" },
        { label: "Educational", value: "Educational" },
        { label: "Healthcare", value: "Healthcare" },
        { label: "Finance", value: "Finance" },
        { label: "Manufacturing", value: "Manufacturing" },
        { label: "Media", value: "Media" },
        { label: "Retail", value: "Retail" },
      ],
    };
  },

  computed: {
    store() {
      return useFilterStore();
    },

    selectedCompanyTypes: {
      get() {
        return this.store.companyTypes;
      },
      set(val) {
        this.store.companyTypes = val;
      },
    },

    isActive() {
      return this.selectedCompanyTypes.length > 0;
    },

    totalPages() {
      return Math.ceil(this.companyTypeOptions.length / this.pageSize);
    },

    pagedOptions() {
      const start = this.currentPage * this.pageSize;
      return this.companyTypeOptions.slice(start, start + this.pageSize);
    },
  },

  methods: {
    clearFilter() {
      this.selectedCompanyTypes = [];
    },
    nextPage() {
      if (this.currentPage < this.totalPages - 1) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 0) this.currentPage--;
    },
  },
};
</script>

<style scoped>
.company-types-wrapper {
  border: 1px solid #dcdcdc;
  padding: 16px;
  background-color: white;
  transition: all 0.2s ease;
}

.active-filter {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.company-types-container {
  background-color: #f9f9f9;
  border-radius: 6px;
}

.company-types-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.company-types-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 16px;
  line-height: 1.4;
}

.clear-text {
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}
</style>
