<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title" title="Provider Dashboard Overview">Dashboard</h1>
      <p class="page-subtitle">Overview of your practice and patient outcomes</p>
    </div>

    <div class="grid-4 stats-grid">
      <div class="card stat-card">
        <div class="stat-icon patients-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats?.total_patients ?? '--' }}</span>
          <span class="stat-label">Active Patients</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon rx-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats?.active_prescriptions ?? '--' }}</span>
          <span class="stat-label">Active Prescriptions</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon score-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats?.avg_personalization_score?.toFixed(1) ?? '--' }}%</span>
          <span class="stat-label">Avg. Personalization</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon trend-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">92%</span>
          <span class="stat-label">Patient Satisfaction</span>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 24px;">
      <div class="card">
        <h3 class="card-title">Patients by BMI Category</h3>
        <div class="bmi-chart" v-if="stats?.patients_by_bmi_category">
          <div v-for="(count, category) in stats.patients_by_bmi_category" :key="category" class="bmi-bar-row">
            <span class="bmi-label">{{ category }}</span>
            <div class="bmi-bar-bg">
              <div class="bmi-bar-fill" :style="{ width: `${(count / maxBmiCount) * 100}%` }" :class="getBmiBarClass(category as string)"></div>
            </div>
            <span class="bmi-count">{{ count }}</span>
          </div>
        </div>
        <div v-else class="empty-state">No data available yet</div>
      </div>

      <div class="card">
        <h3 class="card-title">Prescription Status</h3>
        <div class="status-grid" v-if="stats?.prescription_status_breakdown">
          <div v-for="(count, status) in stats.prescription_status_breakdown" :key="status" class="status-item">
            <div class="status-count">{{ count }}</div>
            <div class="status-name">
              <span class="badge" :class="getStatusBadge(status as string)">{{ status }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">No prescriptions yet</div>
      </div>
    </div>

    <div class="card" style="margin-top: 24px;">
      <h3 class="card-title">Quick Actions</h3>
      <div class="quick-actions">
        <router-link to="/patients" class="action-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          <span class="action-title">Add New Patient</span>
          <span class="action-desc">Register a patient and start their profile</span>
        </router-link>
        <router-link to="/personalize" class="action-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <span class="action-title">Personalize Prescription</span>
          <span class="action-desc">Run AI-powered medication matching</span>
        </router-link>
        <router-link to="/medications" class="action-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3"/></svg>
          <span class="action-title">Browse Medications</span>
          <span class="action-desc">View all available weight-loss medications</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { GET_DASHBOARD_STATS } from '../graphql/queries';

const { result } = useQuery(GET_DASHBOARD_STATS);
const stats = computed(() => result.value?.dashboardStats);

const maxBmiCount = computed(() => {
  if (!stats.value?.patients_by_bmi_category) return 1;
  return Math.max(...Object.values(stats.value.patients_by_bmi_category).map((v: any) => Number(v)), 1);
});

function getBmiBarClass(category: string): string {
  if (category.includes('Normal')) return 'bar-success';
  if (category.includes('Overweight')) return 'bar-warning';
  if (category.includes('Underweight')) return 'bar-info';
  return 'bar-danger';
}

function getStatusBadge(status: string): string {
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
.stats-grid .stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.patients-icon { background: rgba(11, 110, 79, 0.1); color: var(--primary); }
.rx-icon { background: rgba(44, 105, 141, 0.1); color: var(--info); }
.score-icon { background: rgba(232, 163, 23, 0.1); color: var(--warning); }
.trend-icon { background: rgba(45, 106, 79, 0.1); color: var(--accent); }

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
}

.bmi-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bmi-label {
  width: 100px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: right;
}

.bmi-bar-bg {
  flex: 1;
  height: 24px;
  background: var(--border-light);
  border-radius: 6px;
  overflow: hidden;
}

.bmi-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
  min-width: 20px;
}

.bar-success { background: var(--success); }
.bar-warning { background: var(--warning); }
.bar-danger { background: var(--danger); }
.bar-info { background: var(--info); }

.bmi-count {
  width: 30px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.status-item {
  text-align: center;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.status-count {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
}

.status-name {
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 14px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s;
  border: 1px solid transparent;
}

.action-card:hover {
  border-color: var(--primary);
  background: rgba(11, 110, 79, 0.03);
  transform: translateY(-2px);
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  margin-top: 12px;
}

.action-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

@media (max-width: 768px) {
  .quick-actions { grid-template-columns: 1fr; }
}
</style>
