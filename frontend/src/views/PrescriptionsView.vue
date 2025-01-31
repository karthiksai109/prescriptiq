<template>
  <div class="prescriptions-page">
    <div class="page-header">
      <h1 class="page-title">Prescriptions</h1>
      <p class="page-subtitle">Manage and track all active and historical prescriptions</p>
    </div>

    <div class="card filter-bar">
      <div class="filters">
        <button v-for="s in statuses" :key="s.value" class="filter-btn" :class="{ active: activeFilter === s.value }" @click="activeFilter = s.value">
          {{ s.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">Loading prescriptions...</div>

    <div v-else-if="prescriptions && prescriptions.length > 0" class="rx-list">
      <div v-for="rx in prescriptions" :key="rx.id" class="card rx-card">
        <div class="rx-header">
          <div class="rx-med-info">
            <h3 class="rx-med-name">{{ rx.medication?.name }}</h3>
            <span class="rx-med-category">{{ rx.medication?.category }}</span>
          </div>
          <span class="badge" :class="getStatusClass(rx.status)">{{ rx.status }}</span>
        </div>
        <div class="rx-patient">
          <router-link :to="`/patients/${rx.patient?.id}`" class="patient-link">
            {{ rx.patient?.first_name }} {{ rx.patient?.last_name }}
          </router-link>
          <span class="rx-bmi">BMI: {{ rx.patient?.bmi }} ({{ rx.patient?.bmiCategory }})</span>
        </div>
        <div class="rx-details">
          <div class="rx-detail">
            <span class="detail-label">Dosage</span>
            <span class="detail-value">{{ rx.dosage }}</span>
          </div>
          <div class="rx-detail">
            <span class="detail-label">Frequency</span>
            <span class="detail-value">{{ rx.frequency }}</span>
          </div>
          <div class="rx-detail">
            <span class="detail-label">Duration</span>
            <span class="detail-value">{{ rx.duration_weeks }} weeks</span>
          </div>
          <div class="rx-detail">
            <span class="detail-label">Refills</span>
            <span class="detail-value">{{ rx.refills_remaining }}</span>
          </div>
        </div>
        <div class="rx-footer">
          <div class="personalization-meter">
            <span class="meter-label">Personalization Score</span>
            <div class="meter-bar">
              <div class="meter-fill" :style="{ width: rx.personalization_score + '%' }" :class="getScoreClass(rx.personalization_score)"></div>
            </div>
            <span class="meter-value">{{ rx.personalization_score }}%</span>
          </div>
          <div class="rx-dates">
            <span>Started: {{ rx.start_date }}</span>
            <span v-if="rx.end_date">Ended: {{ rx.end_date }}</span>
          </div>
        </div>
        <div v-if="rx.notes" class="rx-notes">
          <strong>Notes:</strong> {{ rx.notes }}
        </div>
      </div>
    </div>

    <div v-else class="card empty-state">
      <p>No prescriptions found for the selected filter.</p>
      <router-link to="/personalize" class="btn btn-primary" style="margin-top: 12px;">Personalize a New Prescription</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { GET_PRESCRIPTIONS } from '../graphql/queries';

const activeFilter = ref<string | undefined>(undefined);

const statuses = [
  { label: 'All', value: undefined as string | undefined },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
];

const { result, loading } = useQuery(GET_PRESCRIPTIONS, () => ({
  status: activeFilter.value,
}));

const prescriptions = computed(() => result.value?.prescriptions || []);

function getStatusClass(status: string): string {
  switch (status) {
    case 'active': return 'badge-success';
    case 'completed': return 'badge-info';
    case 'paused': return 'badge-warning';
    case 'cancelled': return 'badge-danger';
    default: return '';
  }
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-mid';
  return 'score-low';
}
</script>

<style scoped>
.filter-bar { margin-bottom: 20px; }

.filters {
  display: flex;
  gap: 8px;
}

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

.rx-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rx-card { border: 1px solid var(--border); }

.rx-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rx-med-name { font-size: 17px; font-weight: 700; }
.rx-med-category { font-size: 12px; color: var(--text-secondary); }

.rx-patient {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.patient-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}
.patient-link:hover { text-decoration: underline; }

.rx-bmi { font-size: 12px; color: var(--text-muted); }

.rx-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.detail-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value { font-size: 14px; font-weight: 600; }

.rx-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.personalization-meter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meter-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.meter-bar {
  width: 120px;
  height: 8px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
}

.meter-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.score-high { background: var(--success); }
.score-mid { background: var(--warning); }
.score-low { background: var(--danger); }

.meter-value { font-size: 14px; font-weight: 700; }

.rx-dates {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
}

.rx-notes {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .rx-details { grid-template-columns: repeat(2, 1fr); }
}
</style>
