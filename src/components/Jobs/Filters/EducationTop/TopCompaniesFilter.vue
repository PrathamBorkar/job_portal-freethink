<template>
  <div class="companies-wrapper" :class="{ 'active-filter': isActive }">
    <div class="companies-container q-pa-md q-mb-md">
      <div class="row items-center justify-between q-mb-sm">
        <div class="companies-title">Companies</div>
        <div v-if="isActive" class="clear-text" @click="clearCompanies">
          Clear
        </div>
      </div>

      <div class="companies-subtitle">
        Selected: {{ selectedCompanies.length || "None" }}
      </div>

      <q-select
        ref="qSelect"
        outlined
        dense
        v-model="selectedCompanies"
        :options="filteredDropdownOptions"
        label="Select Companies"
        emit-value
        map-options
        multiple
        use-input
        fill-input
        input-debounce="0"
        :popup-content-class="'custom-dropdown'"
        :dropdown-icon="null"
        :display-value="''"
        @filter="onDropdownFilter"
        @new-value="handleNewCompany"
        @update:model-value="handleModelUpdate"
        class="q-mb-md"
      >
        <template v-slot:append>
          <q-icon
            v-if="selectedCompanies.length === 1"
            name="business"
            class="q-ml-xs"
          />
          <q-icon
            v-else-if="selectedCompanies.length > 1"
            name="domain"
            class="q-ml-xs"
          />
        </template>
      </q-select>

      <div v-if="selectedCompanies.length" class="companies-subtitle q-mb-xs">
        Selected Companies
      </div>

      <div class="row q-gutter-sm q-mb-md">
        <div
          v-for="companyValue in selectedCompanies"
          :key="'selected-' + companyValue"
          class="custom-chip selected-chip row items-center no-wrap"
          @click="toggleCompany(companyValue)"
        >
          <span class="chip-label">{{ getCompanyLabel(companyValue) }}</span>
          <q-icon name="close" class="chip-close-icon" />
        </div>
      </div>

      <div v-if="filteredCompanies.length" class="companies-subtitle">
        Popular Companies
      </div>

      <div class="row q-gutter-sm">
        <div
          v-for="company in filteredCompanies"
          :key="'popular-' + company.value"
          class="custom-chip row items-center no-wrap"
          @click="toggleCompany(company.value)"
        >
          <span class="chip-label">{{ company.label }}</span>
          <q-icon name="add" class="chip-add-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFilterStore } from "src/stores/filter-store";

export default {
  name: "TopCompaniesFilter",
  data() {
    const store = useFilterStore();
    return {
      search: "",
      store,
      filteredDropdownOptions: [],
    };
  },

  computed: {
    selectedCompanies: {
      get() {
        return this.store.selectedCompanies;
      },
      set(val) {
        this.store.selectedCompanies = val;
      },
    },

    filteredCompanies() {
      const searchLower = this.search.toLowerCase();
      return this.store.companies
        .slice(0, 6)
        .filter((company) => !this.selectedCompanies.includes(company.value))
        .filter((company) => company.label.toLowerCase().includes(searchLower));
    },

    isActive() {
      return this.selectedCompanies.length > 0;
    },
  },

  methods: {
    toggleCompany(companyValue) {
      const index = this.selectedCompanies.indexOf(companyValue);
      if (index === -1) {
        this.selectedCompanies = [...this.selectedCompanies, companyValue];
      } else {
        const newSelection = [...this.selectedCompanies];
        newSelection.splice(index, 1);
        this.selectedCompanies = newSelection;
      }
      this.clearInput();
    },

    clearCompanies() {
      this.selectedCompanies = [];
    },

    onDropdownFilter(val, update) {
      this.search = val || "";
      if (!val || val.trim() === "") {
        this.filteredDropdownOptions = [];
        update();
        return;
      }
      const searchLower = val.toLowerCase();
      this.filteredDropdownOptions = this.store.companies
        .filter((company) => !this.selectedCompanies.includes(company.value))
        .filter((company) => company.label.toLowerCase().includes(searchLower));
      update();
    },

    handleNewCompany(inputValue) {
      const normalized = inputValue.trim().toLowerCase();
      const match = this.store.companies.find(
        (c) => c.label.toLowerCase() === normalized
      );
      if (match && !this.selectedCompanies.includes(match.value)) {
        this.selectedCompanies = [...this.selectedCompanies, match.value];
        this.clearInput();
      }
    },

    handleModelUpdate(val) {
      this.selectedCompanies = val;
      this.clearInput();
    },

    clearInput() {
      setTimeout(() => {
        if (this.$refs.qSelect) {
          this.$refs.qSelect.updateInputValue("");
          this.$refs.qSelect.inputValue = "";
        }
      }, 0);
    },

    getCompanyLabel(value) {
      const company = this.store.companies.find((c) => c.value === value);
      return company ? company.label : value;
    },
  },

  mounted() {
    this.store.companies;
  },
};
</script>

<style scoped>
.companies-wrapper {
  border: 1px solid #dcdcdc;
  background-color: white;
  transition: all 0.2s ease;
  padding: 16px;
}

.active-filter {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.companies-container {
  background-color: #f9f9f9;
  border-radius: 6px;
}

.companies-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.companies-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 8px;
  line-height: 1.4;
}

.custom-chip {
  border: 1px solid #007aff;
  background-color: #f0f7ff;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  padding: 2px 8px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.selected-chip {
  background-color: #e0f2fe;
  border-color: #0284c7;
}

.chip-label {
  padding: 0 6px;
}

.chip-add-icon {
  font-size: 16px;
  color: #007aff;
  margin-left: 6px;
}

.chip-close-icon {
  font-size: 16px;
  color: #0284c7;
  margin-left: 6px;
}

.clear-text {
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}
</style>
