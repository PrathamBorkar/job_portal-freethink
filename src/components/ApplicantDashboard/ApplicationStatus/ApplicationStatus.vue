<template>
  <div class="bottom-section row q-mt-sm">
    <!-- LEFT SIDE -->
    <div class="left-side">
      <AppliedJobs class="widget" />
    </div>

    <!-- RIGHT SIDE -->
  </div>
</template>

<script>
import AppliedJobs from "./AppliedJobs.vue";

export default {
  name: "BottomOne",
  components: {
    AppliedJobs,
  },
};
</script>

<style scoped>
.bottom-section {
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
  gap: 12px;
  flex-wrap: nowrap;
  background-color: transparent;
}

.left-side {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.widget {
  flex: 1;
  background: transparent;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}

.widget:last-child {
  margin-bottom: 0;
}

/* MOBILE FIX */
@media (max-width: 900px) {
  .bottom-section {
    flex-direction: column;
    flex-wrap: nowrap;
  }

  .right-side {
    margin-left: 0 !important;
  }

  .left-side .widget {
    max-height: 60vh;
    overflow-y: auto;
  }
}

/* CUSTOM SCROLLBAR */
.widget::-webkit-scrollbar {
  width: 8px;
}
.widget::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}
.widget::-webkit-scrollbar-thumb {
  background: #cccccc;
  border-radius: 8px;
}
.widget::-webkit-scrollbar-thumb:hover {
  background: #b3b3b3;
}

/* Firefox */
.widget {
  scrollbar-width: thin;
  scrollbar-color: #ccc #f1f1f1;
}
</style>
