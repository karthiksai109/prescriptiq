import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

import path from 'path';

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '..', '..', 'prescriptiq.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Import models
import { Patient, initPatientModel } from './Patient';
import { Provider, initProviderModel } from './Provider';
import { Prescription, initPrescriptionModel } from './Prescription';
import { HealthMetric, initHealthMetricModel } from './HealthMetric';
import { Medication, initMedicationModel } from './Medication';
import { Interaction, initInteractionModel } from './Interaction';

// Initialize all models
initPatientModel(sequelize);
initProviderModel(sequelize);
initPrescriptionModel(sequelize);
initHealthMetricModel(sequelize);
initMedicationModel(sequelize);
initInteractionModel(sequelize);

// Define Associations
Provider.hasMany(Patient, { foreignKey: 'provider_id', as: 'patients' });
Patient.belongsTo(Provider, { foreignKey: 'provider_id', as: 'provider' });

Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Provider.hasMany(Prescription, { foreignKey: 'provider_id', as: 'prescriptions' });
Prescription.belongsTo(Provider, { foreignKey: 'provider_id', as: 'provider' });

Patient.hasMany(HealthMetric, { foreignKey: 'patient_id', as: 'healthMetrics' });
HealthMetric.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Prescription.belongsTo(Medication, { foreignKey: 'medication_id', as: 'medication' });
Medication.hasMany(Prescription, { foreignKey: 'medication_id', as: 'prescriptions' });

Medication.belongsToMany(Medication, {
  through: Interaction,
  as: 'interactsWith',
  foreignKey: 'medication_a_id',
  otherKey: 'medication_b_id',
});

export { Patient, Provider, Prescription, HealthMetric, Medication, Interaction };
