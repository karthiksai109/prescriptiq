import { Patient, Provider, Prescription, HealthMetric, Medication } from '../models';
import { Op } from 'sequelize';
import { Context } from '../middleware/auth';

export const patientResolvers = {
  Query: {
    patients: async (_: any, { limit = 20, offset = 0, search }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const where: any = { provider_id: context.provider.id };
      if (search) {
        where[Op.or] = [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const patients = await Patient.findAll({
        where,
        limit,
        offset,
        include: [
          { model: Provider, as: 'provider' },
          { model: Prescription, as: 'prescriptions', include: [{ model: Medication, as: 'medication' }] },
          { model: HealthMetric, as: 'healthMetrics', limit: 10, order: [['recorded_at', 'DESC']] },
        ],
        order: [['created_at', 'DESC']],
      });

      return patients.map((p: any) => ({
        ...p.toJSON(),
        bmi: parseFloat((p.weight_kg / Math.pow(p.height_cm / 100, 2)).toFixed(1)),
        bmiCategory: getBmiCategory(p.weight_kg / Math.pow(p.height_cm / 100, 2)),
      }));
    },
    patient: async (_: any, { id }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const patient = await Patient.findByPk(id, {
        include: [
          { model: Provider, as: 'provider' },
          { model: Prescription, as: 'prescriptions', include: [{ model: Medication, as: 'medication' }] },
          { model: HealthMetric, as: 'healthMetrics', order: [['recorded_at', 'DESC']] },
        ],
      });

      if (!patient) throw new Error('Patient not found');
      const p = patient.toJSON() as any;
      return {
        ...p,
        bmi: parseFloat((p.weight_kg / Math.pow(p.height_cm / 100, 2)).toFixed(1)),
        bmiCategory: getBmiCategory(p.weight_kg / Math.pow(p.height_cm / 100, 2)),
      };
    },
  },
  Mutation: {
    createPatient: async (_: any, { input }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const patient = await Patient.create({
        ...input,
        provider_id: context.provider.id,
      });

      const p = patient.toJSON() as any;
      return {
        ...p,
        bmi: parseFloat((p.weight_kg / Math.pow(p.height_cm / 100, 2)).toFixed(1)),
        bmiCategory: getBmiCategory(p.weight_kg / Math.pow(p.height_cm / 100, 2)),
      };
    },
    updatePatient: async (_: any, { id, input }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const patient = await Patient.findByPk(id);
      if (!patient) throw new Error('Patient not found');

      await patient.update(input);

      // If weight was updated, auto-record a health metric
      if (input.weight_kg) {
        await HealthMetric.create({
          patient_id: id,
          metric_type: 'weight',
          value: input.weight_kg,
          unit: 'kg',
          recorded_at: new Date(),
        });
      }

      const p = patient.toJSON() as any;
      return {
        ...p,
        bmi: parseFloat((p.weight_kg / Math.pow(p.height_cm / 100, 2)).toFixed(1)),
        bmiCategory: getBmiCategory(p.weight_kg / Math.pow(p.height_cm / 100, 2)),
      };
    },
    deactivatePatient: async (_: any, { id }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const patient = await Patient.findByPk(id);
      if (!patient) throw new Error('Patient not found');

      await patient.update({ is_active: false });
      const p = patient.toJSON() as any;
      return {
        ...p,
        bmi: parseFloat((p.weight_kg / Math.pow(p.height_cm / 100, 2)).toFixed(1)),
        bmiCategory: getBmiCategory(p.weight_kg / Math.pow(p.height_cm / 100, 2)),
      };
    },
  },
};

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese Class I';
  if (bmi < 40) return 'Obese Class II';
  return 'Obese Class III';
}
