<template>
  <div class="markets-wrapper" :class="{ 'active-filter': isActive }">
    <div class="markets-container q-pa-md q-mb-md">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="markets-title">Markets</div>
        <div v-if="isActive" class="clear-text" @click="clearMarkets">
          Clear
        </div>
      </div>

      <!-- Subtitle -->
      <div class="markets-subtitle">
        Selected: {{ selectedMarkets.length || "None" }}
      </div>

      <!-- 🔽 Dropdown Select -->
      <q-select
        ref="qSelect"
        outlined
        dense
        v-model="selectedMarkets"
        :options="filteredDropdownOptions"
        label="Select Markets"
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
        @new-value="handleNewMarket"
        @update:model-value="(val) => handleModelUpdate(val)"
        class="q-mb-md"
      >
        <template v-slot:append>
          <q-icon
            v-if="selectedMarkets.length === 1"
            name="work"
            class="q-ml-xs"
          />
          <q-icon
            v-else-if="selectedMarkets.length > 1"
            name="business"
            class="q-ml-xs"
          />
        </template>
      </q-select>

      <!-- 🔷 Selected Markets -->
      <div v-if="selectedMarkets.length" class="markets-subtitle q-mb-xs">
        Selected Markets
      </div>
      <div class="row q-gutter-sm q-mb-md">
        <div
          v-for="marketId in selectedMarkets"
          :key="'selected-' + marketId"
          class="custom-chip selected-chip row items-center no-wrap"
          @click="toggleMarket(marketId)"
        >
          <span class="chip-label">{{ getMarketLabel(marketId) }}</span>
          <q-icon name="close" class="chip-close-icon" />
        </div>
      </div>

      <!-- 🔷 Popular Markets -->
      <div v-if="filteredMarkets.length" class="markets-subtitle">Popular</div>
      <div class="row q-gutter-sm">
        <div
          v-for="market in filteredMarkets"
          :key="'popular-' + market.value"
          class="custom-chip row items-center no-wrap"
          @click="toggleMarket(market.value)"
        >
          <span class="chip-label">{{ market.label }}</span>
          <q-icon name="add" class="chip-add-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFilterStore } from "src/stores/filter-store";

export default {
  name: "MarketsFilter",
  data() {
    const store = useFilterStore();
    return {
      search: "",
      store,
      filteredDropdownOptions: [],
    };
  },

  computed: {
    selectedMarkets: {
      get() {
        return this.store.selectedMarkets || [];
      },
      set(val) {
        // Normalize to array
        this.store.selectedMarkets = Array.isArray(val)
          ? val
          : val
          ? [val]
          : [];
      },
    },

    filteredMarkets() {
      const searchLower = this.search.toLowerCase();
      return this.store.markets
        .slice(0, 6)
        .filter((m) => !this.selectedMarkets.includes(m.value))
        .filter((m) => m.label.toLowerCase().includes(searchLower));
    },

    isActive() {
      return this.selectedMarkets.length > 0;
    },
  },

  methods: {
    toggleMarket(marketId) {
      let updated;
      const index = this.selectedMarkets.indexOf(marketId);
      if (index === -1) {
        updated = [...this.selectedMarkets, marketId];
      } else {
        updated = [...this.selectedMarkets];
        updated.splice(index, 1);
      }

      if (!this.filteredDropdownOptions.find((m) => m.value === marketId)) {
        const marketObj = this.store.markets.find((m) => m.value === marketId);
        if (marketObj) {
          this.filteredDropdownOptions.push(marketObj);
        }
      }

      this.handleModelUpdate(updated);

      if (this.$refs.qSelect) {
        this.$refs.qSelect.updateInputValue("");
      }
    },
    onDropdownFilter(val, update) {
      this.search = val || "";
      if (!val || val.trim() === "") {
        this.filteredDropdownOptions = [];
        update();
        return;
      }

      const searchLower = val.toLowerCase();
      this.filteredDropdownOptions = this.store.markets
        .filter((m) => !this.selectedMarkets.includes(m.value))
        .filter((m) => m.label.toLowerCase().includes(searchLower));

      update();
    },

    handleNewMarket(inputValue) {
      const normalized = inputValue.trim().toLowerCase();
      const match = this.store.markets.find(
        (m) => m.label.toLowerCase() === normalized
      );

      if (match && !this.selectedMarkets.includes(match.value)) {
        this.selectedMarkets = [...this.selectedMarkets, match.value];

        setTimeout(() => {
          if (this.$refs.qSelect) {
            this.$refs.qSelect.updateInputValue("");
            this.$refs.qSelect.inputValue = "";
          }
        }, 0);
      }
    },

    getMarketLabel(id) {
      const market = this.store.markets.find((m) => m.value === id);
      return market ? market.label : id;
    },

    handleModelUpdate(val) {
      this.selectedMarkets = val;
    },
  },

  mounted() {
    this.store.markets;
  },
};
</script>

<style scoped>
.markets-wrapper {
  border: 1px solid #dcdcdc;
  background-color: white;
  transition: all 0.2s ease;
  padding: 16px;
}

.active-filter {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.markets-container {
  background-color: #f9f9f9;
  border-radius: 6px;
}

.markets-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.markets-subtitle {
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
