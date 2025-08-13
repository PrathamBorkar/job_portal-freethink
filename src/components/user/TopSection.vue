<template>
  <div class="top-section">
    <!-- Navbar -->
    <div class="user-navbar q-py-xs q-px-md row no-wrap items-center block-section">
      <q-tabs
        :model-value="tab"
        @update:model-value="$emit('update:tab', $event)"
        dense
        align="left"
        class="user-tabs"
        indicator-color="primary"
        active-color="primary"
        shrinks
      >
        <q-tab
          v-for="item in tabs"
          :key="item"
          :name="item"
          :label="item"
          :class="tab === item ? 'is-active' : ''"
          class="user-tab q-px-md"
          no-caps
        />
      </q-tabs>
    </div>

    <!-- User Panel -->
    <div class="user-panel row no-wrap items-center block-section">
      <!-- Avatar -->
      <q-avatar size="74px" class="avatar-box q-mr-md">
        <img
          src="https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg"
          alt="User Avatar"
          width="100"
        />
      </q-avatar>

      <!-- Main Info -->
      <div class="main-info column justify-center">
        <div class="user-name">Yash Pikulkar</div>
        <div class="user-title">
          <span class="position text-primary">Frontend Developer</span>
          <span class="sep">|</span>
          <span class="department">Intern</span>
        </div>
      </div>

      <!-- Spacer -->
      <q-space />

      <!-- Detail Fields & Vertical Separator -->
      <div class="detail-info row no-wrap items-center">
        <!-- Info Column -->
        <div class="info-col column q-pr-xl">
          <div class="label">Phone Number:</div>
          <div class="value strong">+91 98765 43210</div>
          <div class="label q-mt-sm">Email:</div>
          <div class="value email">yash@example.com</div>
          <div class="label q-mt-sm">Role:</div>
          <div class="value">Candidate</div>
        </div>

        <!-- Vertical Separator -->
        <div class="vertical-separator q-mx-md"></div>

        <!-- Premium Button -->
        <q-btn label="Premium" class="premium-btn" unelevated flat rounded />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopSection',
  props: {
    tab: {
      type: String,
      required: true,
    },
  },
  emits: ['update:tab'],
  data() {
    return {
      tabs: [
        'Details',
        'Application Status',
        'Resumes & Links',
        'Recommended Jobs',
        'Special Feature',
      ],
    }
  },
}
</script>

<style scoped>
.top-section {
  flex: 0 0 auto;
  margin-bottom: 16px;
}

.block-section {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.user-navbar {
  width: 100%;
}

.user-tabs {
  width: 100%;
}

.user-tab {
  font-weight: 500;
  color: #757575;
  transition: all 0.3s ease;
}

.user-tab.is-active {
  color: #212121;
  font-weight: 600;
}

.user-panel {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  min-height: 94px;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 15px;
  align-items: center;
}

.avatar-box {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.main-info .user-name {
  font-size: 20px;
  font-weight: 600;
  color: #212121;
}

.user-title {
  font-size: 15px;
  color: #757575;
  margin-top: 4px;
}

.position.text-primary {
  color: #212121;
  font-weight: 500;
}

.sep {
  margin: 0 8px;
  color: #e0e0e0;
}

.detail-info {
  font-size: 15px;
  color: #212121;
}

.label {
  font-size: 13px;
  color: #757575;
}

.value {
  font-size: 15px;
  color: #212121;
  margin-top: 2px;
}

.value.strong {
  font-weight: 600;
}

.value.email {
  color: #212121;
  text-decoration: underline;
}

.premium-btn {
  border: 1px solid #212121;
  color: #212121;
  padding: 6px 18px;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  background-color: transparent;
  transition: all 0.3s ease;
}

.premium-btn:hover {
  background-color: #212121;
  color: white;
}

.vertical-separator {
  height: 48px;
  width: 1px;
  background-color: #e0e0e0;
}

@media (max-width: 900px) {
  .user-panel {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-box {
    margin-bottom: 16px;
  }

  .main-info {
    margin-bottom: 16px;
  }

  .detail-info {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .info-col {
    width: 100%;
    padding-right: 0 !important;
    margin-bottom: 16px;
  }

  .vertical-separator {
    display: none;
  }

  .premium-btn {
    width: 100%;
    margin-top: 16px;
  }
}
</style>
