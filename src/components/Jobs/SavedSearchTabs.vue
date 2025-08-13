<!-- SavedSearchTabs.vue -->
<template>
  <div class="q-pa-md">
    <!-- Tabs Header -->
    <div class="row items-center q-gutter-sm q-mb-sm">
      <q-tabs
        v-model="activeTab"
        align="left"
        narrow-indicator
        dense
        active-color="primary"
        class="text-weight-medium"
      >
        <q-tab
          v-for="(tab, index) in tabs"
          :key="index"
          :name="index"
          :label="tab.label"
        />
      </q-tabs>

      <!-- Add New Tab Button -->
      <q-btn dense flat icon="add" @click="addNewTab" />
    </div>

    <!-- Render the Active Tab's Filters -->
    <div v-if="tabs[activeTab]">
      <SavedSearchSection v-model="tabs[activeTab].filters" />
    </div>
  </div>
</template>

<script>
import SavedSearchSection from "./SavedSearchSection.vue";

export default {
  name: "SavedSearchTabs",
  components: {
    SavedSearchSection,
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: "Saved Sea...",
          filters: {
            jobTitle: "",
            location: "",
            region: "MUMBAI +1",
            selectedTags: ["Python"],
            remoteMode: "",
          },
        },
      ],
    };
  },
  methods: {
    addNewTab() {
      this.tabs.push({
        label: `Saved Search ${this.tabs.length + 1}`,
        filters: {
          jobTitle: "",
          location: "",
          region: "",
          selectedTags: [],
          remoteMode: "",
        },
      });
      this.activeTab = this.tabs.length - 1;
    },
  },
};
</script>
