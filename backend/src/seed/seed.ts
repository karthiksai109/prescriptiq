import dotenv from 'dotenv';
dotenv.config();

import { sequelize, Provider, Patient, Medication, Prescription, HealthMetric, Interaction } from '../models';
import bcrypt from 'bcryptjs';

async function seed(): Promise<void> {
  const startTime = Date.now();
  console.log('Seeding database...');

  await sequelize.sync({ force: true });

  // Create demo provider
  const passwordHash = await bcrypt.hash('demo123', 12);
  const provider = await Provider.create({
    first_name: 'Dr. Sarah',
    last_name: 'Mitchell',
    email: 'sarah@prescriptiq.com',
    password_hash: passwordHash,
    specialty: 'Endocrinology & Weight Management',
    license_number: 'MD-2024-WM-1001',
  });

  // Create medications (real weight-loss medications)
  const medications = await Medication.bulkCreate([
    {
      name: 'Semaglutide (Wegovy)',
      generic_name: 'Semaglutide',
      brand_name: 'Wegovy',
      category: 'GLP-1 Receptor Agonist',
      description: 'FDA-approved GLP-1 receptor agonist for chronic weight management. Works by mimicking the hormone GLP-1, reducing appetite and food intake.',
      dosage_forms: ['subcutaneous injection'],
      contraindications: ['medullary thyroid carcinoma', 'MEN 2 syndrome', 'pancreatitis history'],
      side_effects: ['nausea', 'diarrhea', 'vomiting', 'constipation', 'abdominal pain'],
      weight_loss_applicable: true,
      min_bmi_threshold: 27,
      requires_monitoring: true,
    },
    {
      name: 'Tirzepatide (Mounjaro)',
      generic_name: 'Tirzepatide',
      brand_name: 'Mounjaro',
      category: 'GLP-1/GIP Dual Agonist',
      description: 'Dual GIP and GLP-1 receptor agonist for type 2 diabetes and weight management. Targets two incretin hormones for enhanced efficacy.',
      dosage_forms: ['subcutaneous injection'],
      contraindications: ['medullary thyroid carcinoma', 'MEN 2 syndrome', 'severe GI disease'],
      side_effects: ['nausea', 'diarrhea', 'decreased appetite', 'vomiting', 'injection site reaction'],
      weight_loss_applicable: true,
      min_bmi_threshold: 27,
      requires_monitoring: true,
    },
    {
      name: 'Liraglutide (Saxenda)',
      generic_name: 'Liraglutide',
      brand_name: 'Saxenda',
      category: 'GLP-1 Receptor Agonist',
      description: 'GLP-1 receptor agonist approved for weight management. Daily injection that helps regulate appetite and caloric intake.',
      dosage_forms: ['subcutaneous injection'],
      contraindications: ['medullary thyroid carcinoma', 'MEN 2 syndrome', 'pregnancy'],
      side_effects: ['nausea', 'hypoglycemia', 'diarrhea', 'constipation', 'headache'],
      weight_loss_applicable: true,
      min_bmi_threshold: 27,
      requires_monitoring: true,
    },
    {
      name: 'Orlistat (Xenical)',
      generic_name: 'Orlistat',
      brand_name: 'Xenical',
      category: 'Lipase Inhibitor',
      description: 'Gastrointestinal lipase inhibitor that reduces dietary fat absorption by approximately 30%. Available in prescription and OTC forms.',
      dosage_forms: ['capsule'],
      contraindications: ['chronic malabsorption', 'cholestasis', 'pregnancy'],
      side_effects: ['oily stools', 'flatulence', 'fecal urgency', 'fatty/oily stool'],
      weight_loss_applicable: true,
      min_bmi_threshold: 30,
      requires_monitoring: false,
    },
    {
      name: 'Phentermine-Topiramate (Qsymia)',
      generic_name: 'Phentermine/Topiramate',
      brand_name: 'Qsymia',
      category: 'Combination Appetite Suppressant',
      description: 'Combination of phentermine (sympathomimetic amine) and topiramate (anticonvulsant) for weight management.',
      dosage_forms: ['capsule'],
      contraindications: ['glaucoma', 'hyperthyroidism', 'MAO inhibitor use', 'pregnancy'],
      side_effects: ['paresthesia', 'dizziness', 'insomnia', 'constipation', 'dry mouth'],
      weight_loss_applicable: true,
      min_bmi_threshold: 27,
      requires_monitoring: true,
    },
    {
      name: 'Metformin',
      generic_name: 'Metformin',
      brand_name: 'Glucophage',
      category: 'Biguanide',
      description: 'First-line medication for type 2 diabetes that also supports modest weight loss through improved insulin sensitivity.',
      dosage_forms: ['tablet', 'extended-release tablet'],
      contraindications: ['renal impairment', 'metabolic acidosis', 'liver disease'],
      side_effects: ['diarrhea', 'nausea', 'abdominal pain', 'lactic acidosis (rare)'],
      weight_loss_applicable: true,
      min_bmi_threshold: 25,
      requires_monitoring: true,
    },
  ]);

  // Create interactions
  await Interaction.bulkCreate([
    {
      medication_a_id: medications[0].id, // Semaglutide
      medication_b_id: medications[2].id, // Liraglutide
      severity: 'contraindicated',
      description: 'Do not use two GLP-1 receptor agonists simultaneously',
      clinical_effect: 'Increased risk of severe GI side effects and pancreatitis',
    },
    {
      medication_a_id: medications[0].id, // Semaglutide
      medication_b_id: medications[1].id, // Tirzepatide
      severity: 'contraindicated',
      description: 'Overlapping GLP-1 mechanism; concurrent use is not recommended',
      clinical_effect: 'Duplicative mechanism increases adverse event risk without added benefit',
    },
    {
      medication_a_id: medications[4].id, // Qsymia
      medication_b_id: medications[5].id, // Metformin
      severity: 'moderate',
      description: 'Topiramate may increase metformin levels',
      clinical_effect: 'Monitor blood glucose and adjust metformin dose as needed',
    },
  ]);

  // Create patients with realistic data
  const patientsData = [
    {
      first_name: 'Emily', last_name: 'Carter', email: 'emily.carter@email.com',
      date_of_birth: new Date('1988-05-14'), gender: 'female' as const, height_cm: 165, weight_kg: 92,
      blood_type: 'A+', allergies: ['penicillin'], medical_conditions: ['type 2 diabetes', 'hypertension'],
      phone: '555-0101', provider_id: provider.id,
    },
    {
      first_name: 'James', last_name: 'Robinson', email: 'james.robinson@email.com',
      date_of_birth: new Date('1975-11-22'), gender: 'male' as const, height_cm: 180, weight_kg: 118,
      blood_type: 'O+', allergies: [], medical_conditions: ['sleep apnea', 'pre-diabetes'],
      phone: '555-0102', provider_id: provider.id,
    },
    {
      first_name: 'Maria', last_name: 'Gonzalez', email: 'maria.gonzalez@email.com',
      date_of_birth: new Date('1992-03-08'), gender: 'female' as const, height_cm: 158, weight_kg: 85,
      blood_type: 'B+', allergies: ['sulfa'], medical_conditions: ['PCOS', 'insulin resistance'],
      phone: '555-0103', provider_id: provider.id,
    },
    {
      first_name: 'Robert', last_name: 'Chen', email: 'robert.chen@email.com',
      date_of_birth: new Date('1965-08-30'), gender: 'male' as const, height_cm: 172, weight_kg: 105,
      blood_type: 'AB+', allergies: [], medical_conditions: ['type 2 diabetes', 'high cholesterol', 'hypertension'],
      phone: '555-0104', provider_id: provider.id,
    },
    {
      first_name: 'Ashley', last_name: 'Williams', email: 'ashley.williams@email.com',
      date_of_birth: new Date('1998-12-01'), gender: 'female' as const, height_cm: 170, weight_kg: 78,
      blood_type: 'O-', allergies: ['latex'], medical_conditions: ['anxiety', 'hypothyroidism'],
      phone: '555-0105', provider_id: provider.id,
    },
  ];

  const patients = await Patient.bulkCreate(patientsData);

  // Create prescriptions
  const prescriptions = await Prescription.bulkCreate([
    {
      patient_id: patients[0].id, provider_id: provider.id, medication_id: medications[0].id,
      dosage: '0.25mg weekly', frequency: 'Once weekly', duration_weeks: 16,
      status: 'active', start_date: new Date('2025-12-01'), personalization_score: 87.5,
      personalization_factors: { bmi_score: 23, age_score: 15, condition_match: 18, interaction_safety: 15, contraindication_check: 10, allergy_safety: 10, monitoring_readiness: 5 },
      notes: 'Starting dose, titrate up after 4 weeks',
    },
    {
      patient_id: patients[1].id, provider_id: provider.id, medication_id: medications[1].id,
      dosage: '2.5mg weekly', frequency: 'Once weekly', duration_weeks: 24,
      status: 'active', start_date: new Date('2026-01-15'), personalization_score: 91.2,
      personalization_factors: { bmi_score: 25, age_score: 13, condition_match: 20, interaction_safety: 15, contraindication_check: 10, allergy_safety: 10, monitoring_readiness: 5 },
      notes: 'High BMI candidate, monitor blood glucose',
    },
    {
      patient_id: patients[2].id, provider_id: provider.id, medication_id: medications[5].id,
      dosage: '500mg twice daily', frequency: 'Twice daily', duration_weeks: 12,
      status: 'active', start_date: new Date('2026-02-01'), personalization_score: 82.0,
      personalization_factors: { bmi_score: 22, age_score: 15, condition_match: 17, interaction_safety: 15, contraindication_check: 10, allergy_safety: 10, monitoring_readiness: 4 },
      notes: 'Insulin resistance management alongside weight goals',
    },
  ]);

  // Create health metrics (weight tracking over time for patient Emily)
  const weightProgression = [92, 91.5, 91, 90.2, 89.8, 89, 88.5, 87.8, 87.2, 86.5, 86, 85.3];
  for (let i = 0; i < weightProgression.length; i++) {
    await HealthMetric.create({
      patient_id: patients[0].id,
      metric_type: 'weight',
      value: weightProgression[i],
      unit: 'kg',
      recorded_at: new Date(2025, 11, 1 + i * 7), // Weekly recordings
    });
  }

  // Blood pressure for Emily
  const bpValues = [
    { sys: 142, dia: 92 }, { sys: 140, dia: 90 }, { sys: 138, dia: 88 },
    { sys: 135, dia: 86 }, { sys: 133, dia: 85 }, { sys: 130, dia: 82 },
  ];
  for (let i = 0; i < bpValues.length; i++) {
    await HealthMetric.create({
      patient_id: patients[0].id,
      metric_type: 'blood_pressure',
      value: bpValues[i].sys,
      secondary_value: bpValues[i].dia,
      unit: 'mmHg',
      recorded_at: new Date(2025, 11, 1 + i * 14),
    });
  }

  // Weight tracking for James
  const jamesWeights = [118, 117.2, 116, 115.3, 114, 113.2, 112, 111.5];
  for (let i = 0; i < jamesWeights.length; i++) {
    await HealthMetric.create({
      patient_id: patients[1].id,
      metric_type: 'weight',
      value: jamesWeights[i],
      unit: 'kg',
      recorded_at: new Date(2026, 0, 15 + i * 7),
    });
  }

  console.log(`
  =============================================
  Database seeded successfully!
  =============================================
  Demo Login:
    Email: sarah@prescriptiq.com
    Password: demo123
  =============================================
  Created:
    - 1 Provider (Dr. Sarah Mitchell)
    - ${patients.length} Patients
    - ${medications.length} Medications
    - ${prescriptions.length} Active Prescriptions
    - Health metrics with weight tracking data
    - Drug interaction data
  =============================================
  `);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
