import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type Provider {
    id: Int!
    first_name: String!
    last_name: String!
    email: String!
    specialty: String!
    license_number: String!
    is_active: Boolean!
    patients: [Patient!]
    prescriptions: [Prescription!]
    createdAt: DateTime
  }

  type Patient {
    id: Int!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: String!
    gender: String!
    height_cm: Float!
    weight_kg: Float!
    blood_type: String!
    allergies: [String!]
    medical_conditions: [String!]
    phone: String!
    is_active: Boolean!
    bmi: Float!
    bmiCategory: String!
    provider: Provider
    prescriptions: [Prescription!]
    healthMetrics: [HealthMetric!]
    createdAt: DateTime
  }

  type Medication {
    id: Int!
    name: String!
    generic_name: String!
    brand_name: String!
    category: String!
    description: String!
    dosage_forms: [String!]
    contraindications: [String!]
    side_effects: [String!]
    weight_loss_applicable: Boolean!
    min_bmi_threshold: Float
    requires_monitoring: Boolean!
    interactsWith: [Medication!]
  }

  type Prescription {
    id: Int!
    patient: Patient!
    provider: Provider!
    medication: Medication!
    dosage: String!
    frequency: String!
    duration_weeks: Int!
    status: String!
    start_date: String!
    end_date: String
    personalization_score: Float!
    personalization_factors: JSON
    notes: String
    refills_remaining: Int!
    createdAt: DateTime
  }

  type HealthMetric {
    id: Int!
    patient_id: Int!
    metric_type: String!
    value: Float!
    unit: String!
    secondary_value: Float
    recorded_at: DateTime!
    notes: String
  }

  type Interaction {
    id: Int!
    medication_a_id: Int!
    medication_b_id: Int!
    severity: String!
    description: String!
    clinical_effect: String!
  }

  type AuthPayload {
    token: String!
    provider: Provider!
  }

  type PersonalizationResult {
    recommended_medication: Medication!
    personalization_score: Float!
    factors: JSON!
    warnings: [String!]!
    alternative_medications: [Medication!]!
    dosage_recommendation: String!
    monitoring_plan: String!
  }

  type DashboardStats {
    total_patients: Int!
    active_prescriptions: Int!
    avg_personalization_score: Float!
    patients_by_bmi_category: JSON!
    prescription_status_breakdown: JSON!
    recent_health_trends: JSON!
    top_medications: JSON!
  }

  type WeightProgressReport {
    patient: Patient!
    starting_weight: Float!
    current_weight: Float!
    goal_weight: Float!
    weight_lost: Float!
    percent_to_goal: Float!
    weekly_trend: [Float!]!
    projected_goal_date: String
    recommendation: String!
  }

  input RegisterInput {
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    specialty: String!
    license_number: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreatePatientInput {
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: String!
    gender: String!
    height_cm: Float!
    weight_kg: Float!
    blood_type: String!
    allergies: [String!]
    medical_conditions: [String!]
    phone: String!
  }

  input UpdatePatientInput {
    first_name: String
    last_name: String
    weight_kg: Float
    height_cm: Float
    allergies: [String!]
    medical_conditions: [String!]
    phone: String
    is_active: Boolean
  }

  input CreatePrescriptionInput {
    patient_id: Int!
    medication_id: Int!
    dosage: String!
    frequency: String!
    duration_weeks: Int!
    notes: String
  }

  input RecordHealthMetricInput {
    patient_id: Int!
    metric_type: String!
    value: Float!
    unit: String!
    secondary_value: Float
    notes: String
  }

  type Query {
    # Auth
    me: Provider

    # Patients
    patients(limit: Int, offset: Int, search: String): [Patient!]!
    patient(id: Int!): Patient

    # Medications
    medications(category: String, weightLossOnly: Boolean): [Medication!]!
    medication(id: Int!): Medication
    checkInteractions(medicationIds: [Int!]!): [Interaction!]!

    # Prescriptions
    prescriptions(patientId: Int, status: String): [Prescription!]!
    prescription(id: Int!): Prescription

    # Health Metrics
    healthMetrics(patientId: Int!, metricType: String, startDate: String, endDate: String): [HealthMetric!]!

    # Intelligence
    personalizePrescription(patientId: Int!, targetCondition: String!): PersonalizationResult!
    dashboardStats: DashboardStats!
    weightProgress(patientId: Int!, goalWeight: Float!): WeightProgressReport!
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Patients
    createPatient(input: CreatePatientInput!): Patient!
    updatePatient(id: Int!, input: UpdatePatientInput!): Patient!
    deactivatePatient(id: Int!): Patient!

    # Prescriptions
    createPrescription(input: CreatePrescriptionInput!): Prescription!
    updatePrescriptionStatus(id: Int!, status: String!): Prescription!
    cancelPrescription(id: Int!, reason: String!): Prescription!

    # Health Metrics
    recordHealthMetric(input: RecordHealthMetricInput!): HealthMetric!
    recordBatchHealthMetrics(inputs: [RecordHealthMetricInput!]!): [HealthMetric!]!
  }
`;
