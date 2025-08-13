<template>
  <div class="q-mb-md">
    <!-- Title -->
    <h4 class="text-h4 text-weight-bold q-mb-sm">Search for jobs</h4>

    <!-- Tabs -->
    <div class="row items-center q-gutter-md">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selected = tab.name"
        class="cursor-pointer row items-center"
        :class="[
          'tab-item',
          selected === tab.name ? 'selected-tab' : 'text-grey-7',
        ]"
      >
        <span class="text-body1 q-mr-xs">{{ tab.label }}</span>

        <!-- Badge for Saved tab -->
        <q-badge
          v-if="tab.name === 'saved'"
          color="grey-4"
          text-color="black"
          label="1"
          class="q-pa-xs q-mx-xs"
          style="font-size: 10px; border-radius: 4px"
        />
      </div>
    </div>

    <!-- Underline for active tab -->
    <div class="underline q-mt-xs" />
  </div>
</template>

<script>
export default {
  name: "JobHeader",
  data() {
    return {
      selected: "browse",
      tabs: [
        { name: "browse", label: "Browse all" },
        { name: "saved", label: "Saved" },
        { name: "hidden", label: "Hidden" },
      ],
    };
  },
};
</script>

<style scoped>
.tab-item {
  font-weight: 500;
  font-size: 16px;
  position: relative;
}
.selected-tab {
  color: black;
  font-weight: bold;
}
.underline {
  height: 2px;
  background-color: black;
  width: 70px; /* You can dynamically calculate width */
}
</style>
