<template>
  <q-dialog
    v-model="showDialog"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    persistent
    @hide="closeDialog"
  >
    <q-card flat bordered class="q-pa-lg dialog-card">
      <!-- Close Icon -->
      <q-btn icon="close" flat round dense color="grey-6" class="close-icon" @click="closeDialog" />

      <div v-if="company" class="scroll">
        <div class="side-by-side-layout">
          <!-- Left card -->
          <q-card flat bordered class="top-card q-pa-lg">
            <div class="row no-wrap items-center q-gutter-md">
              <q-avatar size="80px" class="custom-logo-avatar">
                <img :src="company.logo" />
              </q-avatar>

              <div class="col q-pl-md">
                <div class="company-name">{{ company.name }}</div>
                <div class="company-size">{{ company.size }} people</div>

                <!-- Tags -->
                <div class="tags-row q-mt-sm">
                  <div v-if="company.hiringStatus" class="custom-chip custom-chip-black small-tag">
                    {{ company.hiringStatus }}
                  </div>
                  <div
                    v-for="(tag, i) in company.companyTags"
                    :key="i"
                    class="custom-chip custom-chip-pink small-tag"
                  >
                    {{ tag }}
                  </div>
                </div>

                <!-- Description -->
                <div class="company-description q-mt-sm q-mb-xs" v-if="company.description">
                  {{ company.description }}
                </div>
              </div>
            </div>
          </q-card>

          <!-- Right card -->
          <q-card flat bordered class="bottom-card q-pa-lg">
            <div class="about-title">ABOUT {{ company.name.toUpperCase() }}</div>

            <!-- Locations -->
            <div class="info-block" v-if="company.locations.length">
              <div class="info-label">Locations</div>
              <div class="info-value">
                <span
                  v-for="(loc, idx) in company.locations"
                  :key="idx"
                  class="link-black"
                  @click="searchLocation(loc)"
                >
                  {{ loc }}
                  <span v-if="idx < company.locations.length - 1">,&nbsp;</span>
                </span>
              </div>
            </div>

            <!-- Company size -->
            <div class="info-block">
              <div class="info-label">Company size</div>
              <div class="info-value">{{ company.size }} people</div>
            </div>

            <!-- CEO -->
            <div class="info-block" v-if="company.ceo">
              <div class="info-label">CEO</div>
              <div class="info-value">{{ company.ceo }}</div>
            </div>

            <!-- Website -->
            <div class="info-block" v-if="company.website">
              <div class="info-label">Website</div>
              <div class="info-value link-black" @click="openLink(company.website)">
                {{ company.website }}
              </div>
            </div>

            <!-- Other Links -->
            <div class="info-block" v-if="company.otherLinks.length">
              <div class="info-label">Links</div>
              <div class="info-value">
                <span
                  v-for="(link, idx) in company.otherLinks"
                  :key="idx"
                  class="link-black"
                  @click="openLink(link)"
                >
                  {{ link }}
                  <span v-if="idx < company.otherLinks.length - 1">,&nbsp;</span>
                </span>
              </div>
            </div>

            <!-- Company type -->
            <div class="info-block" v-if="company.companyType.length">
              <div class="info-label">Company type</div>
              <div class="tag-row">
                <span v-for="(tag, idx) in company.companyType" :key="idx" class="custom-tag">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Markets -->
            <div class="info-block" v-if="company.markets.length">
              <div class="info-label">Markets</div>
              <div class="tag-row">
                <span v-for="(market, idx) in company.markets" :key="idx" class="custom-tag">
                  {{ market }}
                </span>
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <div v-else class="q-pa-md">Loading company details...</div>
    </q-card>
  </q-dialog>
</template>

<script>
import { computed } from 'vue'
import { useJobsStore } from 'src/stores/job-store'

export default {
  name: 'CompanyDetailsCard',
  setup() {
    const jobsStore = useJobsStore()

    const showDialog = computed({
      get: () => jobsStore.companyDialogVisible,
      set: (val) => {
        if (!val) jobsStore.closeCompanyDialog()
      },
    })

    function ensureArray(field) {
      if (!field) return []
      if (Array.isArray(field)) return field
      return field.split(',').map((s) => s.trim())
    }

    const company = computed(() => {
      const raw = jobsStore.selectedCompany
      if (!raw) return null

      return {
        logo: raw.logo || 'https://via.placeholder.com/64',
        name: raw.name || 'Unknown Company',
        hiringStatus: raw.status || null,
        size: raw.companySize || 'Unknown size',
        ceo: raw.CEO || null,
        companyTags: Array.isArray(raw.tags) ? raw.tags : [],
        description: raw.description || '',
        locations: ensureArray(raw.locations),
        markets: ensureArray(raw.markets),
        companyType: ensureArray(raw.type),
        website: raw.links && raw.links.length > 0 ? raw.links[0] : null,
        otherLinks: raw.links && raw.links.length > 1 ? raw.links.slice(1) : [],
      }
    })

    function openLink(link) {
      if (link) window.open(link, '_blank')
    }

    function searchLocation(loc) {
      console.log(`Search jobs in: ${loc}`)
    }

    function closeDialog() {
      jobsStore.closeCompanyDialog()
    }

    return {
      showDialog,
      company,
      closeDialog,
      openLink,
      searchLocation,
    }
  },
}
</script>

<style scoped>
.dialog-card {
  width: 100vw;
  height: 80vh;
  max-width: 100vw;
  border-radius: 20px;
  position: relative;
}

.scroll {
  height: 100%;
  overflow-y: auto;
}

.side-by-side-layout {
  display: flex;
  gap: 20px;
  padding-top: 20px;
}

.top-card {
  flex: 1;
  min-height: 32vh;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #ccc;
  display: flex;
  align-items: flex-start;
}

.bottom-card {
  flex: 1.2; /* slightly bigger than left card */
  min-height: 35vh;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12); /* stronger shadow */
  border: 1px solid #bbb; /* a bit darker border */
  padding-bottom: 16px;
}

.about-title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 16px;
}

.info-block {
  margin-bottom: 12px;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #6e6e73;
}

.info-value {
  font-size: 15px;
  margin-top: 4px;
}

.link-black {
  color: #000;
  cursor: pointer;
  text-decoration: none;
}

.link-black:hover {
  text-decoration: underline;
}

.custom-logo-avatar {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background-color: white;
  padding: 6px;
  width: 100px !important;
  height: 100px !important;
}

.company-name {
  font-size: 28px;
  font-weight: 700;
  margin-top: 8px;
}

.company-size {
  font-size: 15px;
  color: #6e6e73;
  margin-top: 6px;
}

.company-description {
  font-size: 16px;
  line-height: 1.5;
  margin-top: 12px;
  margin-bottom: 10px;
  color: #4a4a4a;
  max-width: 500px;
}

.tags-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
}

.custom-chip {
  font-weight: 500;
  border-radius: 8px;
  padding: 5px 14px;
  font-size: 14px;
}

.small-tag {
  font-size: 12px;
  padding: 3px 10px;
}

.custom-chip-pink {
  border: 1px solid #ff4c61;
  background-color: #fff1f3;
}

.custom-chip-black {
  border: 1px solid #28a745;
  background-color: #e6f4ea;
}

.custom-tag {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 13px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.close-icon {
  position: absolute;
  top: 8px;
  right: 8px;
}

@media (max-width: 1024px) {
  .side-by-side-layout {
    flex-direction: column;
  }
}
</style>
