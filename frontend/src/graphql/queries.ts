import gql from 'graphql-tag';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      provider {
        id
        first_name
        last_name
        email
        specialty
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      provider {
        id
        first_name
        last_name
        email
        specialty
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      first_name
      last_name
      email
      specialty
      license_number
    }
  }
`;

export const GET_PATIENTS = gql`
  query GetPatients($limit: Int, $offset: Int, $search: String) {
    patients(limit: $limit, offset: $offset, search: $search) {
      id
      first_name
      last_name
      email
      date_of_birth
      gender
      height_cm
      weight_kg
      blood_type
      allergies
      medical_conditions
      phone
      is_active
      bmi
      bmiCategory
      createdAt
      prescriptions {
        id
        status
        medication {
          name
        }
      }
    }
  }
`;

export const GET_PATIENT = gql`
  query GetPatient($id: Int!) {
    patient(id: $id) {
      id
      first_name
      last_name
      email
      date_of_birth
      gender
      height_cm
      weight_kg
      blood_type
      allergies
      medical_conditions
      phone
      is_active
      bmi
      bmiCategory
      provider {
        first_name
        last_name
      }
      prescriptions {
        id
        dosage
        frequency
        status
        start_date
        personalization_score
        medication {
          name
          category
        }
      }
      healthMetrics {
        id
        metric_type
        value
        unit
        secondary_value
        recorded_at
      }
    }
  }
`;

export const CREATE_PATIENT = gql`
  mutation CreatePatient($input: CreatePatientInput!) {
    createPatient(input: $input) {
      id
      first_name
      last_name
      email
      bmi
      bmiCategory
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($id: Int!, $input: UpdatePatientInput!) {
    updatePatient(id: $id, input: $input) {
      id
      first_name
      last_name
      weight_kg
      bmi
      bmiCategory
    }
  }
`;

export const GET_MEDICATIONS = gql`
  query GetMedications($category: String, $weightLossOnly: Boolean) {
    medications(category: $category, weightLossOnly: $weightLossOnly) {
      id
      name
      generic_name
      brand_name
      category
      description
      dosage_forms
      contraindications
      side_effects
      weight_loss_applicable
      min_bmi_threshold
      requires_monitoring
    }
  }
`;

export const GET_PRESCRIPTIONS = gql`
  query GetPrescriptions($patientId: Int, $status: String) {
    prescriptions(patientId: $patientId, status: $status) {
      id
      dosage
      frequency
      duration_weeks
      status
      start_date
      end_date
      personalization_score
      personalization_factors
      notes
      refills_remaining
      patient {
        id
        first_name
        last_name
        bmi
        bmiCategory
      }
      medication {
        id
        name
        category
      }
      createdAt
    }
  }
`;

export const CREATE_PRESCRIPTION = gql`
  mutation CreatePrescription($input: CreatePrescriptionInput!) {
    createPrescription(input: $input) {
      id
      dosage
      frequency
      status
      personalization_score
      medication {
        name
      }
      patient {
        first_name
        last_name
      }
    }
  }
`;

export const UPDATE_PRESCRIPTION_STATUS = gql`
  mutation UpdatePrescriptionStatus($id: Int!, $status: String!) {
    updatePrescriptionStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const PERSONALIZE_PRESCRIPTION = gql`
  query PersonalizePrescription($patientId: Int!, $targetCondition: String!) {
    personalizePrescription(patientId: $patientId, targetCondition: $targetCondition) {
      recommended_medication {
        id
        name
        generic_name
        brand_name
        category
        description
        dosage_forms
        side_effects
        requires_monitoring
      }
      personalization_score
      factors
      warnings
      alternative_medications {
        id
        name
        category
      }
      dosage_recommendation
      monitoring_plan
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      total_patients
      active_prescriptions
      avg_personalization_score
      patients_by_bmi_category
      prescription_status_breakdown
      top_medications
    }
  }
`;

export const GET_HEALTH_METRICS = gql`
  query GetHealthMetrics($patientId: Int!, $metricType: String, $startDate: String, $endDate: String) {
    healthMetrics(patientId: $patientId, metricType: $metricType, startDate: $startDate, endDate: $endDate) {
      id
      metric_type
      value
      unit
      secondary_value
      recorded_at
    }
  }
`;

export const RECORD_HEALTH_METRIC = gql`
  mutation RecordHealthMetric($input: RecordHealthMetricInput!) {
    recordHealthMetric(input: $input) {
      id
      metric_type
      value
      unit
      recorded_at
    }
  }
`;

export const GET_WEIGHT_PROGRESS = gql`
  query GetWeightProgress($patientId: Int!, $goalWeight: Float!) {
    weightProgress(patientId: $patientId, goalWeight: $goalWeight) {
      patient {
        first_name
        last_name
      }
      starting_weight
      current_weight
      goal_weight
      weight_lost
      percent_to_goal
      weekly_trend
      projected_goal_date
      recommendation
    }
  }
`;

export const CHECK_INTERACTIONS = gql`
  query CheckInteractions($medicationIds: [Int!]!) {
    checkInteractions(medicationIds: $medicationIds) {
      id
      severity
      description
      clinical_effect
    }
  }
`;
