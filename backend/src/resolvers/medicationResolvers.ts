import { Medication, Interaction } from '../models';
import { Op } from 'sequelize';

export const medicationResolvers = {
  Query: {
    medications: async (_: any, { category, weightLossOnly }: any) => {
      const where: any = {};
      if (category) where.category = { [Op.iLike]: `%${category}%` };
      if (weightLossOnly) where.weight_loss_applicable = true;

      return Medication.findAll({ where, order: [['name', 'ASC']] });
    },
    medication: async (_: any, { id }: any) => {
      const med = await Medication.findByPk(id);
      if (!med) throw new Error('Medication not found');
      return med;
    },
    checkInteractions: async (_: any, { medicationIds }: any) => {
      if (medicationIds.length < 2) return [];

      return Interaction.findAll({
        where: {
          [Op.or]: medicationIds.flatMap((idA: number) =>
            medicationIds
              .filter((idB: number) => idB !== idA)
              .map((idB: number) => ({
                medication_a_id: idA,
                medication_b_id: idB,
              }))
          ),
        },
      });
    },
  },
};
