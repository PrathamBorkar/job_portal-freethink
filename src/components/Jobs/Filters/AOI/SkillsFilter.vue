<template>
  <div class="skills-wrapper" :class="{ 'active-filter': isActive }">
    <div class="skills-container q-pa-md q-mb-md">
      <div class="row items-center justify-between q-mb-sm">
        <div class="skills-title">Skills</div>
        <div v-if="isActive" class="clear-text" @click="clearSkills">Clear</div>
      </div>

      <div class="skills-subtitle">
        Selected: {{ selectedSkills.length || "None" }}
      </div>

      <q-select
        ref="qSelect"
        outlined
        dense
        v-model="selectedSkills"
        :options="filteredDropdownOptions"
        label="Select Skills"
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
        @new-value="handleNewSkill"
        @update:model-value="handleModelUpdate"
        class="q-mb-md"
      >
        <template v-slot:append>
          <q-icon
            v-if="selectedSkills.length === 1"
            name="psychology"
            class="q-ml-xs"
          />
          <q-icon
            v-else-if="selectedSkills.length > 1"
            name="engineering"
            class="q-ml-xs"
          />
        </template>
      </q-select>

      <div v-if="selectedSkills.length" class="skills-subtitle q-mb-xs">
        Selected Skills
      </div>

      <div class="row q-gutter-sm q-mb-md">
        <div
          v-for="skillId in selectedSkills"
          :key="'selected-' + skillId"
          class="custom-chip selected-chip row items-center no-wrap"
          @click="toggleSkill(skillId)"
        >
          <span class="chip-label">{{ getSkillLabel(skillId) }}</span>
          <q-icon name="close" class="chip-close-icon" />
        </div>
      </div>

      <div v-if="filteredSkills.length" class="skills-subtitle">Popular</div>

      <div class="row q-gutter-sm">
        <div
          v-for="skillId in filteredSkills"
          :key="'popular-' + skillId"
          class="custom-chip row items-center no-wrap"
          @click="toggleSkill(skillId)"
        >
          <span class="chip-label">{{ getSkillLabel(skillId) }}</span>
          <q-icon name="add" class="chip-add-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFilterStore } from "src/stores/filter-store";

export default {
  name: "SkillsFilter",

  data() {
    return {
      search: "",
      filteredDropdownOptions: [],
      store: useFilterStore(),
    };
  },

  computed: {
    selectedSkills: {
      get() {
        return this.store.selectedSkills || [];
      },
      set(val) {
        this.store.selectedSkills = Array.isArray(val) ? val : val ? [val] : [];
      },
    },

    filteredSkills() {
      const searchLower = this.search?.toLowerCase() || "";
      return (this.store.skills || [])
        .filter((skill) => skill && !this.selectedSkills.includes(skill.value))
        .filter(
          (skill) =>
            skill.label && skill.label.toLowerCase().includes(searchLower)
        )
        .map((skill) => skill.value);
    },

    isActive() {
      return this.selectedSkills.length > 0;
    },
  },

  methods: {
    getSkillLabel(skillId) {
      const skill = (this.store.skills || []).find((s) => s?.value === skillId);
      return skill?.label || skillId;
    },

    toggleSkill(skillId) {
      const index = this.selectedSkills.indexOf(skillId);
      if (index === -1) {
        this.selectedSkills = [...this.selectedSkills, skillId];
      } else {
        const newSelection = [...this.selectedSkills];
        newSelection.splice(index, 1);
        this.selectedSkills = newSelection;
      }
    },

    clearSkills() {
      this.selectedSkills = [];
    },

    onDropdownFilter(val, update) {
      if (!val || val.trim() === "") {
        this.filteredDropdownOptions = [];
        update();
        return;
      }

      const search = val.toLowerCase();
      this.filteredDropdownOptions = (this.store.skills || [])
        .filter((skill) => skill && !this.selectedSkills.includes(skill.value))
        .filter(
          (skill) => skill.label && skill.label.toLowerCase().includes(search)
        )
        .map((skill) => ({ label: skill.label, value: skill.value }));

      update();
    },

    handleNewSkill(inputValue) {
      const normalized = inputValue.trim().toLowerCase();
      const match = (this.store.skills || []).find(
        (skill) => skill?.label && skill.label.toLowerCase() === normalized
      );
      if (match && !this.selectedSkills.includes(match.value)) {
        this.selectedSkills = [...this.selectedSkills, match.value];
        this.clearInput();
      }
    },

    handleModelUpdate(val) {
      this.selectedSkills = val;
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
  },

  mounted() {
    if (!this.store.skills || this.store.skills.length === 0) {
      this.store.skills;
    }
  },
};
</script>

<style scoped>
.skills-wrapper {
  border: 1px solid #dcdcdc;
  background-color: white;
  transition: all 0.2s ease;
  padding: 16px;
}

.active-filter {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.skills-container {
  background-color: #f9f9f9;
  border-radius: 6px;
  overflow: visible;
}

.skills-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.skills-subtitle {
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

.chip-label {
  padding: 0 6px;
}

.chip-add-icon {
  font-size: 16px;
  color: #007aff;
  margin-left: 6px;
}

.selected-chip {
  background-color: #e0f2fe;
  border-color: #0284c7;
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
