<template>
  <div class="patient-detail">
    <div v-if="loading" class="loading-state">Loading patient details...</div>
    <template v-else-if="patient">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <button class="btn btn-secondary" @click="$router.push('/patients')" style="padding: 8px 12px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 class="page-title">{{ patient.first_name }} {{ patient.last_name }}</h1>
            <p class="page-subtitle">{{ patient.email }} &middot; {{ patient.phone }}</p>
          </div>
        </div>
        <span class="badge" :class="patient.is_active ? 'badge-success' : 'badge-danger'" style="font-size: 14px; padding: 6px 16px;">
          {{ patient.is_active ? 'Active' : 'Inactive' }}
        </span>
      </div>

      <div class="grid-4" style="margin-bottom: 24px;">
        <div class="card stat-card-sm">
          <span class="stat-sm-label">BMI</span>
          <span class="stat-sm-value">{{ patient.bmi }}</span>
          <span class="badge" :class="getBmiClass(patient.bmiCategory)">{{ patient.bmiCategory }}</span>
        </div>
        <div class="card stat-card-sm">
          <span class="stat-sm-label">Weight</span>
          <span class="stat-sm-value">{{ patient.weight_kg }} kg</span>
        </div>
        <div class="card stat-card-sm">
          <span class="stat-sm-label">Height</span>
          <span class="stat-sm-value">{{ patient.height_cm }} cm</span>
        </div>
        <div class="card stat-card-sm">
          <span class="stat-sm-label">Blood Type</span>
          <span class="stat-sm-value">{{ patient.blood_type }}</span>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 24px;">
        <div class="card">
          <h3 class="section-title">Patient Information</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Date of Birth</span>
              <span class="info-value">{{ patient.date_of_birth }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Gender</span>
              <span class="info-value" style="text-transform: capitalize;">{{ patient.gender }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Allergies</span>
              <span class="info-value">
                <span v-if="patient.allergies?.length" class="tags-inline">
                  <span v-for="a in patient.allergies" :key="a" class="tag tag-danger">{{ a }}</span>
                </span>
                <span v-else class="text-muted">None reported</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Conditions</span>
              <span class="info-value">
                <span v-if="patient.medical_conditions?.length" class="tags-inline">
                  <span v-for="c in patient.medical_conditions" :key="c" class="tag">{{ c }}</span>
                </span>
                <span v-else class="text-muted">None</span>
              </span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="section-title">Weight Tracking</h3>
          <div v-if="weightMetrics.length > 0" class="weight-chart">
            <div class="chart-bars">
              <div v-for="(m, idx) in weightMetrics.slice(-10)" :key="idx" class="chart-bar-wrapper">
                <div class="chart-bar" :style="{ height: getBarHeight(m.value) + '%' }">
                  <span class="bar-tooltip">{{ m.value }} kg</span>
                </div>
                <span class="bar-label">{{ formatDate(m.recorded_at) }}</span>
              </div>
            </div>
            <div class="weight-summary">
              <span>Start: <strong>{{ weightMetrics[0]?.value }} kg</strong></span>
              <span>Current: <strong>{{ weightMetrics[weightMetrics.length - 1]?.value }} kg</strong></span>
              <span class="weight-diff" :class="weightDiff > 0 ? 'positive' : 'negative'">
                {{ weightDiff > 0 ? '-' : '+' }}{{ Math.abs(weightDiff).toFixed(1) }} kg
              </span>
            </div>
          </div>
          <div v-else class="empty-state-sm">No weight data recorded yet</div>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">Active Prescriptions</h3>
        <div v-if="patient.prescriptions?.length > 0" class="rx-table">
          <table>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Score</th>
                <th>Start Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rx in patient.prescriptions" :key="rx.id">
                <td><strong>{{ rx.medication?.name }}</strong><br><span class="text-sm text-muted">{{ rx.medication?.category }}</span></td>
                <td>{{ rx.dosage }}</td>
                <td>{{ rx.frequency }}</td>
                <td><span class="badge" :class="getStatusClass(rx.status)">{{ rx.status }}</span></td>
                <td>
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: rx.personalization_score + '%' }"></div>
                    <span class="score-text">{{ rx.personalization_score }}%</span>
                  </div>
                </td>
                <td>{{ rx.start_date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state-sm">No prescriptions yet.
          <router-link to="/personalize" class="link">Personalize a prescription</router-link>
        </div>
      </div>

      <div class="card" style="margin-top: 20px;" v-if="bpMetrics.length > 0">
        <h3 class="section-title">Blood Pressure History</h3>
        <div class="bp-grid">
          <div v-for="(m, idx) in bpMetrics" :key="idx" class="bp-item">
            <span class="bp-value">{{ m.value }}/{{ m.secondary_value }}</span>
            <span class="bp-unit">mmHg</span>
            <span class="bp-date">{{ formatDate(m.recorded_at) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { GET_PATIENT } from '../graphql/queries';

const route = useRoute();
const patientId = computed(() => parseInt(route.params.id as string));

const { result, loading } = useQuery(GET_PATIENT, () => ({ id: patientId.value }));
const patient = computed(() => result.value?.patient);

const weightMetrics = computed(() =>
  (patient.value?.healthMetrics || []).filter((m: any) => m.metric_type === 'weight').sort((a: any, b: any) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
);

const bpMetrics = computed(() =>
  (patient.value?.healthMetrics || []).filter((m: any) => m.metric_type === 'blood_pressure').sort((a: any, b: any) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
);

const weightDiff = computed(() => {
  if (weightMetrics.value.length < 2) return 0;
  return weightMetrics.value[0].value - weightMetrics.value[weightMetrics.value.length - 1].value;
});

function getBarHeight(value: number): number {
  if (weightMetrics.value.length === 0) return 50;
  const values = weightMetrics.value.map((m: any) => m.value);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  return ((value - min) / (max - min)) * 80 + 10;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getBmiClass(cat: string): string {
  if (cat === 'Normal') return 'badge-success';
  if (cat === 'Overweight') return 'badge-warning';
  if (cat === 'Underweight') return 'badge-info';
  return 'badge-danger';
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'active': return 'badge-success';
    case 'completed': return 'badge-info';
    case 'paused': return 'badge-warning';
    case 'cancelled': return 'badge-danger';
    default: return '';
  }
}
</script>

<style scoped>
.stat-card-sm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.stat-sm-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-sm-value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.info-grid { display: flex; flex-direction: column; gap: 12px; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 100px;
}

.info-value { font-size: 13px; font-weight: 600; text-align: right; }

.tags-inline { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; }

.tag {
  padding: 2px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.tag-danger {
  background: rgba(199, 62, 29, 0.08);
  border-color: rgba(199, 62, 29, 0.2);
  color: var(--danger);
}

.text-muted { color: var(--text-muted); }
.text-sm { font-size: 12px; }

.weight-chart { }

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
  padding: 8px 0;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.chart-bar {
  width: 100%;
  max-width: 36px;
  background: linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 10px;
  transition: height 0.3s ease;
}

.chart-bar:hover .bar-tooltip {
  opacity: 1;
}

.bar-tooltip {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text-primary);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
}

.bar-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 4px;
}

.weight-summary {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
  font-size: 13px;
  color: var(--text-secondary);
}

.weight-diff { font-weight: 700; }
.weight-diff.positive { color: var(--success); }
.weight-diff.negative { color: var(--danger); }

.rx-table { overflow-x: auto; }

.rx-table table {
  width: 100%;
  border-collapse: collapse;
}

.rx-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}

.rx-table td {
  padding: 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--border-light);
}

.score-bar {
  width: 100px;
  height: 20px;
  background: var(--border-light);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 10px;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-state-sm {
  text-align: center;
  padding: 32px;
  color: var(--text-muted);
  font-size: 14px;
}

.link { color: var(--primary); text-decoration: underline; }

.bp-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.bp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  min-width: 80px;
}

.bp-value { font-size: 18px; font-weight: 700; }
.bp-unit { font-size: 10px; color: var(--text-muted); }
.bp-date { font-size: 11px; color: var(--text-secondary); margin-top: 4px; }

.loading-state {
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
}
</style>
