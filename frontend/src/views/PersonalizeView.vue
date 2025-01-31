<template>
  <div class="personalize-page">
    <div class="page-header">
      <h1 class="page-title">Personalize Prescription</h1>
      <p class="page-subtitle">AI-powered medication matching based on patient health profile</p>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 class="section-title">Select Patient & Condition</h3>
        <div class="form-group">
          <label class="label">Patient</label>
          <select v-model="selectedPatientId" class="input-field">
            <option :value="null" disabled>Choose a patient...</option>
            <option v-for="p in patients" :key="p.id" :value="p.id">
              {{ p.first_name }} {{ p.last_name }} (BMI: {{ p.bmi }} - {{ p.bmiCategory }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">Target Condition</label>
          <select v-model="targetCondition" class="input-field">
            <option value="weight_loss">Weight Loss / Obesity Management</option>
            <option value="type_2_diabetes">Type 2 Diabetes</option>
            <option value="metabolic_syndrome">Metabolic Syndrome</option>
          </select>
        </div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 8px;" @click="runPersonalization" :disabled="!selectedPatientId || personalizing">
          {{ personalizing ? 'Analyzing...' : 'Run Personalization Engine' }}
        </button>

        <div v-if="selectedPatient" class="patient-preview">
          <h4>Patient Profile</h4>
          <div class="preview-grid">
            <div class="preview-item">
              <span class="preview-label">BMI</span>
              <span class="preview-value">{{ selectedPatient.bmi }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Category</span>
              <span class="badge" :class="getBmiClass(selectedPatient.bmiCategory)">{{ selectedPatient.bmiCategory }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Weight</span>
              <span class="preview-value">{{ selectedPatient.weight_kg }} kg</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Gender</span>
              <span class="preview-value" style="text-transform: capitalize;">{{ selectedPatient.gender }}</span>
            </div>
          </div>
          <div v-if="selectedPatient.allergies?.length" class="preview-section">
            <span class="preview-label">Allergies</span>
            <div class="tags-row">
              <span v-for="a in selectedPatient.allergies" :key="a" class="tag tag-danger">{{ a }}</span>
            </div>
          </div>
          <div v-if="selectedPatient.medical_conditions?.length" class="preview-section">
            <span class="preview-label">Conditions</span>
            <div class="tags-row">
              <span v-for="c in selectedPatient.medical_conditions" :key="c" class="tag">{{ c }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card" v-if="result">
        <h3 class="section-title">Personalization Results</h3>
        
        <div class="result-hero">
          <div class="score-circle" :class="getScoreColor(result.personalization_score)">
            <span class="score-number">{{ result.personalization_score }}</span>
            <span class="score-label">Score</span>
          </div>
          <div class="hero-info">
            <h2 class="recommended-name">{{ result.recommended_medication.name }}</h2>
            <span class="recommended-category">{{ result.recommended_medication.category }}</span>
            <p class="recommended-desc">{{ result.recommended_medication.description }}</p>
          </div>
        </div>

        <div class="factors-section">
          <h4>Scoring Factors Breakdown</h4>
          <div class="factors-grid">
            <div v-for="(val, key) in result.factors" :key="key" class="factor-item">
              <div class="factor-header">
                <span class="factor-name">{{ formatFactorName(key as string) }}</span>
                <span class="factor-score">{{ val }}/{{ getMaxScore(key as string) }}</span>
              </div>
              <div class="factor-bar">
                <div class="factor-fill" :style="{ width: (val / getMaxScore(key as string)) * 100 + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="result.warnings?.length" class="warnings-section">
          <h4>Warnings</h4>
          <div v-for="w in result.warnings" :key="w" class="warning-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>{{ w }}</span>
          </div>
        </div>

        <div class="dosage-section">
          <h4>Recommended Dosage</h4>
          <p class="dosage-text">{{ result.dosage_recommendation }}</p>
        </div>

        <div class="monitoring-section">
          <h4>Monitoring Plan</h4>
          <p class="monitoring-text">{{ result.monitoring_plan }}</p>
        </div>

        <div v-if="result.alternative_medications?.length" class="alternatives-section">
          <h4>Alternative Medications</h4>
          <div class="alternatives-list">
            <div v-for="alt in result.alternative_medications" :key="alt.id" class="alt-item">
              <span class="alt-name">{{ alt.name }}</span>
              <span class="alt-category">{{ alt.category }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card empty-result" v-else-if="!personalizing">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <h3>Ready to Personalize</h3>
        <p>Select a patient and condition, then run the personalization engine to get AI-powered medication recommendations.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useLazyQuery } from '@vue/apollo-composable';
import { GET_PATIENTS, PERSONALIZE_PRESCRIPTION } from '../graphql/queries';

const selectedPatientId = ref<number | null>(null);
const targetCondition = ref('weight_loss');
const personalizing = ref(false);
const result = ref<any>(null);

const { result: patientsResult } = useQuery(GET_PATIENTS, { limit: 50 });
const patients = computed(() => patientsResult.value?.patients || []);

const selectedPatient = computed(() =>
  patients.value.find((p: any) => p.id === selectedPatientId.value)
);

const { load: loadPersonalization, onResult } = useLazyQuery(PERSONALIZE_PRESCRIPTION);

onResult((res: any) => {
  if (res.data?.personalizePrescription) {
    result.value = res.data.personalizePrescription;
  }
  personalizing.value = false;
});

function runPersonalization() {
  if (!selectedPatientId.value) return;
  personalizing.value = true;
  result.value = null;
  loadPersonalization(undefined, {
    patientId: selectedPatientId.value,
    targetCondition: targetCondition.value,
  });
}

function getBmiClass(cat: string): string {
  if (cat === 'Normal') return 'badge-success';
  if (cat === 'Overweight') return 'badge-warning';
  if (cat === 'Underweight') return 'badge-info';
  return 'badge-danger';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'score-green';
  if (score >= 60) return 'score-yellow';
  return 'score-red';
}

function formatFactorName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function getMaxScore(key: string): number {
  const maxScores: Record<string, number> = {
    bmi_score: 25, age_score: 15, condition_match: 20,
    interaction_safety: 15, contraindication_check: 10,
    monitoring_readiness: 5, allergy_safety: 10,
  };
  return maxScores[key] || 10;
}
</script>

<style scoped>
.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.patient-preview {
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.patient-preview h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preview-item { display: flex; flex-direction: column; gap: 2px; }
.preview-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.preview-value { font-size: 16px; font-weight: 700; }

.preview-section { margin-top: 12px; }

.tags-row { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
.tag { padding: 2px 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; font-size: 11px; color: var(--text-secondary); }
.tag-danger { background: rgba(199,62,29,0.08); border-color: rgba(199,62,29,0.2); color: var(--danger); }

.result-hero {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-green { background: rgba(11,110,79,0.1); border: 3px solid var(--success); }
.score-yellow { background: rgba(232,163,23,0.1); border: 3px solid var(--warning); }
.score-red { background: rgba(199,62,29,0.1); border: 3px solid var(--danger); }

.score-number { font-size: 24px; font-weight: 800; line-height: 1; }
.score-label { font-size: 10px; color: var(--text-muted); font-weight: 600; }

.recommended-name { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
.recommended-category { font-size: 13px; color: var(--primary); font-weight: 600; }
.recommended-desc { font-size: 13px; color: var(--text-secondary); margin-top: 8px; line-height: 1.5; }

.factors-section, .warnings-section, .dosage-section, .monitoring-section, .alternatives-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.factors-section h4, .warnings-section h4, .dosage-section h4, .monitoring-section h4, .alternatives-section h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}

.factors-grid { display: flex; flex-direction: column; gap: 10px; }

.factor-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
.factor-name { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
.factor-score { font-size: 12px; font-weight: 700; }

.factor-bar { height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.factor-fill { height: 100%; background: var(--primary); border-radius: 3px; transition: width 0.3s; }

.warning-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(232,163,23,0.06);
  border: 1px solid rgba(232,163,23,0.2);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.dosage-text, .monitoring-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  background: var(--bg-primary);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
}

.alternatives-list { display: flex; flex-direction: column; gap: 8px; }

.alt-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
}

.alt-name { font-size: 14px; font-weight: 600; }
.alt-category { font-size: 12px; color: var(--text-secondary); }

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 400px;
}

.empty-icon { margin-bottom: 20px; }
.empty-result h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.empty-result p { font-size: 14px; color: var(--text-secondary); max-width: 300px; line-height: 1.5; }

.form-group { margin-bottom: 16px; }
</style>
