import { Prescription, Patient, Provider, Medication } from '../models';
import { Context } from '../middleware/auth';
import { PersonalizationEngine } from '../services/PersonalizationEngine';

export const prescriptionResolvers = {
  Query: {
    prescriptions: async (_: any, { patientId, status }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const where: any = { provider_id: context.provider.id };
      if (patientId) where.patient_id = patientId;
      if (status) where.status = status;

      return Prescription.findAll({
        where,
        include: [
          { model: Patient, as: 'patient' },
          { model: Provider, as: 'provider' },
          { model: Medication, as: 'medication' },
        ],
        order: [['created_at', 'DESC']],
      });
    },
    prescription: async (_: any, { id }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const rx = await Prescription.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Provider, as: 'provider' },
          { model: Medication, as: 'medication' },
        ],
      });

      if (!rx) throw new Error('Prescription not found');
      return rx;
    },
  },
  Mutation: {
    createPrescription: async (_: any, { input }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      // Run personalization engine to calculate score
      const personalization = await PersonalizationEngine.personalize(
        input.patient_id,
        'weight_loss'
      );

      const prescription = await Prescription.create({
        ...input,
        provider_id: context.provider.id,
        start_date: new Date(),
        personalization_score: personalization.personalization_score,
        personalization_factors: personalization.factors,
      });

      return Prescription.findByPk(prescription.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Provider, as: 'provider' },
          { model: Medication, as: 'medication' },
        ],
      });
    },
    updatePrescriptionStatus: async (_: any, { id, status }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const rx = await Prescription.findByPk(id);
      if (!rx) throw new Error('Prescription not found');

      await rx.update({
        status,
        end_date: ['completed', 'cancelled'].includes(status) ? new Date() : null,
      });

      return Prescription.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Provider, as: 'provider' },
          { model: Medication, as: 'medication' },
        ],
      });
    },
    cancelPrescription: async (_: any, { id, reason }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const rx = await Prescription.findByPk(id);
      if (!rx) throw new Error('Prescription not found');

      await rx.update({
        status: 'cancelled',
        end_date: new Date(),
        notes: `Cancelled: ${reason}. Previous notes: ${rx.notes || ''}`,
      });

      return Prescription.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Provider, as: 'provider' },
          { model: Medication, as: 'medication' },
        ],
      });
    },
  },
};
