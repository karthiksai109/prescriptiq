<template>
  <div class="medications-page">
    <div class="page-header">
      <h1 class="page-title">Medications</h1>
      <p class="page-subtitle">Browse and review available weight-loss and metabolic medications</p>
    </div>

    <div class="card filter-bar">
      <div class="filters">
        <button class="filter-btn" :class="{ active: !weightLossOnly }" @click="weightLossOnly = false">All Medications</button>
        <button class="filter-btn" :class="{ active: weightLossOnly }" @click="weightLossOnly = true">Weight Loss Only</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">Loading medications...</div>

    <div v-else-if="medications && medications.length > 0" class="meds-grid">
      <div v-for="med in medications" :key="med.id" class="card med-card" :class="{ expanded: expandedId === med.id }" @click="expandedId = expandedId === med.id ? null : med.id">
        <div class="med-header">
          <div class="med-info">
            <h3 class="med-name">{{ med.name }}</h3>
            <span class="med-generic">{{ med.generic_name }} &middot; {{ med.brand_name }}</span>
          </div>
          <div class="med-badges">
            <span class="badge badge-info">{{ med.category }}</span>
            <span v-if="med.weight_loss_applicable" class="badge badge-success">Weight Loss</span>
            <span v-if="med.requires_monitoring" class="badge badge-warning">Monitoring Req.</span>
          </div>
        </div>

        <p class="med-description">{{ med.description }}</p>

        <div v-if="expandedId === med.id" class="med-expanded">
          <div class="grid-2" style="margin-top: 16px;">
            <div>
              <h4 class="detail-heading">Dosage Forms</h4>
              <div class="tags-row">
                <span v-for="f in med.dosage_forms" :key="f" class="tag">{{ f }}</span>
              </div>
            </div>
            <div>
              <h4 class="detail-heading">Min BMI Threshold</h4>
              <span class="threshold-value" v-if="med.min_bmi_threshold">{{ med.min_bmi_threshold }}</span>
              <span v-else class="text-muted">No threshold</span>
            </div>
          </div>

          <div style="margin-top: 16px;">
            <h4 class="detail-heading">Contraindications</h4>
            <div class="tags-row">
              <span v-for="c in med.contraindications" :key="c" class="tag tag-danger">{{ c }}</span>
              <span v-if="!med.contraindications?.length" class="text-muted">None listed</span>
            </div>
          </div>

          <div style="margin-top: 16px;">
            <h4 class="detail-heading">Side Effects</h4>
            <div class="tags-row">
              <span v-for="s in med.side_effects" :key="s" class="tag tag-warning">{{ s }}</span>
              <span v-if="!med.side_effects?.length" class="text-muted">None listed</span>
            </div>
          </div>
        </div>

        <div class="med-footer">
          <span class="expand-hint">{{ expandedId === med.id ? 'Click to collapse' : 'Click to expand details' }}</span>
        </div>
      </div>
    </div>

    <div v-else class="card empty-state">
      <p>No medications found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { GET_MEDICATIONS } from '../graphql/queries';

const weightLossOnly = ref(false);
const expandedId = ref<number | null>(null);

const { result, loading } = useQuery(GET_MEDICATIONS, () => ({
  weightLossOnly: weightLossOnly.value || undefined,
}));

const medications = computed(() => result.value?.medications || []);
</script>

<style scoped>
.filter-bar { margin-bottom: 20px; }

.filters { display: flex; gap: 8px; }

.filter-btn {
  padding: 6px 16px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.filter-btn:hover { border-color: var(--primary); color: var(--primary); }
.filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }

.meds-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.med-card {
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border);
}

.med-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.med-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.med-name { font-size: 17px; font-weight: 700; }
.med-generic { font-size: 12px; color: var(--text-secondary); }

.med-badges { display: flex; gap: 6px; flex-wrap: wrap; }

.med-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.med-expanded {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-heading {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.tags-row { display: flex; gap: 6px; flex-wrap: wrap; }

.tag {
  padding: 3px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.tag-danger {
  background: rgba(199,62,29,0.06);
  border-color: rgba(199,62,29,0.2);
  color: var(--danger);
}

.tag-warning {
  background: rgba(232,163,23,0.06);
  border-color: rgba(232,163,23,0.2);
  color: var(--warning);
}

.threshold-value { font-size: 24px; font-weight: 800; }
.text-muted { color: var(--text-muted); font-size: 13px; }

.med-footer {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border-light);
}

.expand-hint { font-size: 11px; color: var(--text-muted); font-weight: 500; }

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
}
</style>
