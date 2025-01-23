import { Patient, Prescription, HealthMetric, Medication } from '../models';
import { Context } from '../middleware/auth';
import { PersonalizationEngine } from '../services/PersonalizationEngine';
import { sequelize } from '../models';

export const analyticsResolvers = {
  Query: {
    personalizePrescription: async (_: any, { patientId, targetCondition }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');
      return PersonalizationEngine.personalize(patientId, targetCondition);
    },
    weightProgress: async (_: any, { patientId, goalWeight }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');
      return PersonalizationEngine.weightProgress(patientId, goalWeight);
    },
    dashboardStats: async (_: any, __: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const providerId = context.provider.id;

      const total_patients = await Patient.count({ where: { provider_id: providerId, is_active: true } });
      const active_prescriptions = await Prescription.count({ where: { provider_id: providerId, status: 'active' } });

      // Average personalization score
      const scoreResult = await Prescription.findAll({
        where: { provider_id: providerId },
        attributes: [[sequelize.fn('AVG', sequelize.col('personalization_score')), 'avg_score']],
        raw: true,
      });
      const avg_personalization_score = parseFloat((scoreResult[0] as any)?.avg_score || '0');

      // Patients by BMI category
      const patients = await Patient.findAll({ where: { provider_id: providerId, is_active: true } });
      const bmiCategories: Record<string, number> = {};
      patients.forEach((p: any) => {
        const bmi = p.weight_kg / Math.pow(p.height_cm / 100, 2);
        let cat = 'Normal';
        if (bmi < 18.5) cat = 'Underweight';
        else if (bmi < 25) cat = 'Normal';
        else if (bmi < 30) cat = 'Overweight';
        else if (bmi < 35) cat = 'Obese Class I';
        else if (bmi < 40) cat = 'Obese Class II';
        else cat = 'Obese Class III';
        bmiCategories[cat] = (bmiCategories[cat] || 0) + 1;
      });

      // Prescription status breakdown
      const statusCounts = await Prescription.findAll({
        where: { provider_id: providerId },
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true,
      });
      const prescription_status_breakdown: Record<string, number> = {};
      statusCounts.forEach((s: any) => {
        prescription_status_breakdown[s.status] = parseInt(s.count);
      });

      // Top medications
      const topMeds = await Prescription.findAll({
        where: { provider_id: providerId },
        attributes: ['medication_id', [sequelize.fn('COUNT', sequelize.col('Prescription.id')), 'count']],
        include: [{ model: Medication, as: 'medication', attributes: ['name'] }],
        group: ['medication_id', 'medication.id', 'medication.name'],
        order: [[sequelize.fn('COUNT', sequelize.col('Prescription.id')), 'DESC']],
        limit: 5,
        raw: true,
      });

      return {
        total_patients,
        active_prescriptions,
        avg_personalization_score: parseFloat(avg_personalization_score.toFixed(1)),
        patients_by_bmi_category: bmiCategories,
        prescription_status_breakdown,
        recent_health_trends: {},
        top_medications: topMeds,
      };
    },
  },
};
