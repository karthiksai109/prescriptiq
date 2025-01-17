import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface InteractionAttributes {
  id: number;
  medication_a_id: number;
  medication_b_id: number;
  severity: 'mild' | 'moderate' | 'severe' | 'contraindicated';
  description: string;
  clinical_effect: string;
}

interface InteractionCreationAttributes extends Optional<InteractionAttributes, 'id'> {}

export class Interaction extends Model<InteractionAttributes, InteractionCreationAttributes> implements InteractionAttributes {
  public id!: number;
  public medication_a_id!: number;
  public medication_b_id!: number;
  public severity!: 'mild' | 'moderate' | 'severe' | 'contraindicated';
  public description!: string;
  public clinical_effect!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initInteractionModel(sequelize: Sequelize): void {
  Interaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      medication_a_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      medication_b_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      severity: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      clinical_effect: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'interactions',
      modelName: 'Interaction',
    }
  );
}
