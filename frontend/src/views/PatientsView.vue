<template>
  <div class="patients-page">
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="page-title">Patients</h1>
        <p class="page-subtitle">Manage your patient roster and health profiles</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">+ Add Patient</button>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <input v-model="searchTerm" type="text" class="input-field" placeholder="Search by name or email by name or email..." style="max-width: 400px;" />
    </div>

    <div v-if="loading" class="loading-state">Loading patients...</div>

    <div v-else-if="patients && patients.length > 0" class="patients-grid">
      <div v-for="patient in patients" :key="patient.id" class="card patient-card" @click="$router.push(`/patients/${patient.id}`)">
        <div class="patient-header">
          <div class="patient-avatar" :class="patient.gender === 'female' ? 'avatar-f' : 'avatar-m'">
            {{ patient.first_name[0] }}{{ patient.last_name[0] }}
          </div>
          <div class="patient-basic">
            <h3 class="patient-name">{{ patient.first_name }} {{ patient.last_name }}</h3>
            <span class="patient-email">{{ patient.email }}</span>
          </div>
          <span class="badge" :class="patient.is_active ? 'badge-success' : 'badge-danger'">
            {{ patient.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="patient-metrics">
          <div class="metric">
            <span class="metric-label">BMI</span>
            <span class="metric-value">{{ patient.bmi }}</span>
            <span class="badge" :class="getBmiClass(patient.bmiCategory)">{{ patient.bmiCategory }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Weight</span>
            <span class="metric-value">{{ patient.weight_kg }} kg</span>
          </div>
          <div class="metric">
            <span class="metric-label">Active Rx</span>
            <span class="metric-value">{{ patient.prescriptions?.filter((p: any) => p.status === 'active').length || 0 }}</span>
          </div>
        </div>
        <div class="patient-tags" v-if="patient.medical_conditions?.length">
          <span v-for="cond in patient.medical_conditions.slice(0, 3)" :key="cond" class="tag">{{ cond }}</span>
        </div>
      </div>
    </div>

    <div v-else class="card empty-state">
      <p>No patients found. Add your first patient to get started.</p>
    </div>

    <!-- Add Patient Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h2 class="modal-title">Add New Patient</h2>
        <form @submit.prevent="handleAddPatient">
          <div class="grid-2">
            <div class="form-group">
              <label class="label">First Name</label>
              <input v-model="newPatient.first_name" class="input-field" required />
            </div>
            <div class="form-group">
              <label class="label">Last Name</label>
              <input v-model="newPatient.last_name" class="input-field" required />
            </div>
          </div>
          <div class="form-group">
            <label class="label">Email</label>
            <input v-model="newPatient.email" type="email" class="input-field" required />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="label">Date of Birth</label>
              <input v-model="newPatient.date_of_birth" type="date" class="input-field" required />
            </div>
            <div class="form-group">
              <label class="label">Gender</label>
              <select v-model="newPatient.gender" class="input-field" required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="label">Height (cm)</label>
              <input v-model.number="newPatient.height_cm" type="number" class="input-field" min="50" max="300" required />
            </div>
            <div class="form-group">
              <label class="label">Weight (kg)</label>
              <input v-model.number="newPatient.weight_kg" type="number" class="input-field" min="20" max="500" required />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="label">Blood Type</label>
              <select v-model="newPatient.blood_type" class="input-field" required>
                <option v-for="bt in ['A+','A-','B+','B-','AB+','AB-','O+','O-']" :key="bt" :value="bt">{{ bt }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="label">Phone</label>
              <input v-model="newPatient.phone" class="input-field" required />
            </div>
          </div>
          <div class="form-group">
            <label class="label">Allergies (comma-separated)</label>
            <input v-model="allergiesText" class="input-field" placeholder="penicillin, sulfa" />
          </div>
          <div class="form-group">
            <label class="label">Medical Conditions (comma-separated)</label>
            <input v-model="conditionsText" class="input-field" placeholder="type 2 diabetes, hypertension" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="addingPatient">
              {{ addingPatient ? 'Adding...' : 'Add Patient' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { GET_PATIENTS, CREATE_PATIENT } from '../graphql/queries';

const searchTerm = ref('');
const showAddModal = ref(false);
const addingPatient = ref(false);
const allergiesText = ref('');
const conditionsText = ref('');

const newPatient = ref({
  first_name: '', last_name: '', email: '', date_of_birth: '',
  gender: 'male', height_cm: 170, weight_kg: 80, blood_type: 'O+', phone: '',
});

const { result, loading, refetch } = useQuery(GET_PATIENTS, () => ({
  limit: 50, search: searchTerm.value || undefined,
}));

const patients = computed(() => result.value?.patients || []);

const { mutate: createPatientMutation } = useMutation(CREATE_PATIENT);

let debounceTimer: any;
watch(searchTerm, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => refetch(), 300);
});

async function handleAddPatient() {
  addingPatient.value = true;
  try {
    await createPatientMutation({
      input: {
        ...newPatient.value,
        allergies: allergiesText.value ? allergiesText.value.split(',').map((s: string) => s.trim()) : [],
        medical_conditions: conditionsText.value ? conditionsText.value.split(',').map((s: string) => s.trim()) : [],
      },
    });
    showAddModal.value = false;
    refetch();
    newPatient.value = { first_name: '', last_name: '', email: '', date_of_birth: '', gender: 'male', height_cm: 170, weight_kg: 80, blood_type: 'O+', phone: '' };
    allergiesText.value = '';
    conditionsText.value = '';
  } catch (err: any) {
    alert(err.message);
  } finally {
    addingPatient.value = false;
  }
}

function getBmiClass(category: string): string {
  if (category === 'Normal') return 'badge-success';
  if (category === 'Overweight') return 'badge-warning';
  if (category === 'Underweight') return 'badge-info';
  return 'badge-danger';
}
</script>

<style scoped>
.patients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

.patient-card {
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border);
}

.patient-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.patient-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.avatar-f { background: #7C3AED; }
.avatar-m { background: var(--info); }

.patient-basic { flex: 1; }

.patient-name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
}

.patient-email {
  font-size: 12px;
  color: var(--text-secondary);
}

.patient-metrics {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 12px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 16px;
  font-weight: 700;
}

.patient-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 3px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
  font-size: 15px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  width: 600px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
</style>
