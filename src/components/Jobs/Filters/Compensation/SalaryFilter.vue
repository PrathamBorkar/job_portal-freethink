<template>
  <div class="salary-wrapper" :class="{ 'active-filter': isActive }">
    <div class="salary-container q-pa-md q-mb-md">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="salary-title">Salary</div>
        <div v-if="isActive" class="clear-text" @click="clearFilter">Clear</div>
      </div>

      <!-- Subtitle -->
      <div class="salary-subtitle">{{ computedSalaryLabel }}</div>

      <!-- Inputs -->
      <div class="row items-center justify-start q-col-gutter-sm">
        <div class="col">
          <q-input
            outlined
            dense
            type="number"
            label="Min Salary"
            v-model.number="minSalary"
          />
        </div>

        <div class="dash-separator">—</div>

        <div class="col">
          <q-input
            outlined
            dense
            type="number"
            label="Max Salary (optional)"
            v-model.number="maxSalary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFilterStore } from "src/stores/filter-store";

export default {
  name: "SalaryFilter",

  computed: {
    store() {
      return useFilterStore();
    },

    minSalary: {
      get() {
        return this.store.salary.min;
      },
      set(val) {
        this.store.salary.min = val;
      },
    },

    maxSalary: {
      get() {
        return this.store.salary.max;
      },
      set(val) {
        this.store.salary.max = val;
      },
    },

    isActive() {
      return !!this.minSalary || !!this.maxSalary;
    },

    computedSalaryLabel() {
      if (!this.minSalary && !this.maxSalary) return "Any salary";
      if (this.minSalary && !this.maxSalary) return `₹${this.minSalary}+`;
      if (!this.minSalary && this.maxSalary) return `Up to ₹${this.maxSalary}`;
      return `₹${this.minSalary} - ₹${this.maxSalary}`;
    },
  },

  methods: {
    clearFilter() {
      this.minSalary = "";
      this.maxSalary = "";
    },
  },
};
</script>

<style scoped>
.salary-wrapper {
  border: 1px solid #dcdcdc;
  background-color: white;
  transition: all 0.2s ease;
  padding: 16px;
}

.active-filter {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.salary-container {
  background-color: #f9f9f9;
  border-radius: 6px;
  height: 140px;
}

.salary-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.salary-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 16px;
  line-height: 1.4;
}

.dash-separator {
  font-size: 20px;
  color: #6b7280;
  margin: 0 8px;
  user-select: none;
}

.clear-text {
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}
</style>
