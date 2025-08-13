<template>
  <div class="row q-gutter-sm items-center">
    <!-- Render computed tags as chips -->
    <div
      v-for="tag in computedTags"
      :key="tag"
      class="custom-chip row items-center no-wrap"
    >
      <span class="chip-label">{{ tag }}</span>
      <q-icon name="close" class="chip-remove-icon" @click="removeTag(tag)" />
    </div>

    <!-- Clear All Button -->
    <q-btn
      flat
      dense
      class="text-weight-medium text-grey-8 q-ml-sm"
      label="Clear All"
      @click="clearAll"
      v-if="computedTags.length"
    />
  </div>
</template>

<script>
import { useFilterStore } from "src/stores/filter-store";

export default {
  name: "SelectedTags",

  data() {
    return {
      store: useFilterStore(),
    };
  },

  computed: {
    computedTags() {
      return this.store.computedTags;
    },
  },

  methods: {
    removeTag(tag) {
      this.store.removeTag(tag);
    },
    clearAll() {
      this.store.clearAll();
    },
  },
};
</script>

<style scoped>
.custom-chip {
  border: 1px solid #007aff;
  background-color: #f0f7ff;
  color: #1d1d1f;
  font-family: "Segoe UI", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  font-size: 15px;
  font-weight: 500;
  border-radius: 6px;
  padding: 2px 8px;
  height: 32px;
  display: inline-flex;
  align-items: center;
}

.chip-label {
  padding: 0 6px;
}

.chip-remove-icon {
  font-size: 16px;
  color: #007aff;
  cursor: pointer;
  margin-left: 6px;
}
</style>
