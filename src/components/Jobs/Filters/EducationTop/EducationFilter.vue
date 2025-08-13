<template>
  <div class="education-wrapper" :class="{ 'active-filter': isActive }">
    <div class="education-container q-pa-md q-mb-md">
      <!-- Title + Clear -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="education-title">Education</div>
        <div v-if="isActive" class="clear-text" @click="clearFilter">Clear</div>
      </div>

      <!-- Subtitle -->
      <div class="education-subtitle">
        {{
          selectedEducation.length
            ? selectedEducation.map((e) => e.label).join(", ")
            : "Any Degree"
        }}
      </div>

      <!-- Checkbox Grid (2 per row) -->
      <div class="row q-col-gutter-sm">
        <div class="col-6" v-for="option in pagedOptions" :key="option.value">
          <q-checkbox
            :label="option.label"
            :model-value="isSelected(option.value)"
            @update:model-value="(val) => toggleSelection(val, option)"
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
  name: "EducationFilter",

  data() {
    return {
      currentPage: 0,
      pageSize: 6,
      educationOptions: [
        { label: "Any Postgraduate", value: 1 },
        { label: "MCA", value: 2 },
        { label: "Post Graduation Not Required", value: 3 },
        { label: "M.Tech", value: 4 },
        { label: "MS/M.Sc(Science)", value: 5 },
        { label: "MBA/PGDM", value: 6 },
        { label: "CA", value: 7 },
        { label: "PG Diploma", value: 8 },
        { label: "Medical-MS/MD", value: 9 },
        { label: "B.A", value: 10 },
        { label: "B.Tech/B.E.", value: 11 },
        { label: "Any Graduate", value: 12 },
        { label: "BCA", value: 13 },
        { label: "B.Sc", value: 14 },
        { label: "Diploma", value: 15 },
        { label: "Graduation Not Required", value: 16 },
        { label: "B.Com", value: 17 },
        { label: "B.B.A/ B.M.S", value: 18 },
      ],
    };
  },

  computed: {
    store() {
      return useFilterStore();
    },

    selectedEducation: {
      get() {
        // returns array of objects { id, label }
        return this.store.education;
      },
      set(val) {
        this.store.education = val;
      },
    },

    isActive() {
      return this.selectedEducation.length > 0;
    },

    totalPages() {
      return Math.ceil(this.educationOptions.length / this.pageSize);
    },

    pagedOptions() {
      const start = this.currentPage * this.pageSize;
      return this.educationOptions.slice(start, start + this.pageSize);
    },
  },

  methods: {
    clearFilter() {
      this.selectedEducation = [];
    },
    nextPage() {
      if (this.currentPage < this.totalPages - 1) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 0) this.currentPage--;
    },

    // Check if the option ID is in selectedEducation
    isSelected(id) {
      return this.selectedEducation.some((item) => item.id === id);
    },

    // Toggle selection, add or remove the object { id, label }
    toggleSelection(selected, option) {
      const existsIndex = this.selectedEducation.findIndex(
        (item) => item.id === option.value
      );
      if (selected && existsIndex === -1) {
        // add
        this.selectedEducation = [
          ...this.selectedEducation,
          { id: option.value, label: option.label },
        ];
      } else if (!selected && existsIndex !== -1) {
        // remove
        const newSelection = [...this.selectedEducation];
        newSelection.splice(existsIndex, 1);
        this.selectedEducation = newSelection;
      }
    },
  },
};
</script>

<style scoped>
.education-wrapper {
  border: 1px solid #dcdcdc;
  padding: 16px;
  background-color: white;
  transition: all 0.2s ease;
}

.active-filter {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.education-container {
  background-color: #f9f9f9;
  border-radius: 6px;
}

.education-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.education-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 25px;
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
