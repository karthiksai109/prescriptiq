import { HealthMetric } from '../models';
import { Op } from 'sequelize';
import { Context } from '../middleware/auth';

export const healthMetricResolvers = {
  Query: {
    healthMetrics: async (_: any, { patientId, metricType, startDate, endDate }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const where: any = { patient_id: patientId };
      if (metricType) where.metric_type = metricType;
      if (startDate || endDate) {
        where.recorded_at = {};
        if (startDate) where.recorded_at[Op.gte] = new Date(startDate);
        if (endDate) where.recorded_at[Op.lte] = new Date(endDate);
      }

      return HealthMetric.findAll({
        where,
        order: [['recorded_at', 'ASC']],
      });
    },
  },
  Mutation: {
    recordHealthMetric: async (_: any, { input }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      return HealthMetric.create({
        ...input,
        recorded_at: new Date(),
      });
    },
    recordBatchHealthMetrics: async (_: any, { inputs }: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');

      const metrics = await Promise.all(
        inputs.map((input: any) =>
          HealthMetric.create({
            ...input,
            recorded_at: new Date(),
          })
        )
      );

      return metrics;
    },
  },
};
