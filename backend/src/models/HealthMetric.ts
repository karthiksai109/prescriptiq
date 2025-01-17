import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface HealthMetricAttributes {
  id: number;
  patient_id: number;
  metric_type: 'weight' | 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'cholesterol' | 'bmi';
  value: number;
  unit: string;
  secondary_value: number | null;
  recorded_at: Date;
  notes: string;
}

interface HealthMetricCreationAttributes extends Optional<HealthMetricAttributes, 'id' | 'secondary_value' | 'notes'> {}

export class HealthMetric extends Model<HealthMetricAttributes, HealthMetricCreationAttributes> implements HealthMetricAttributes {
  public id!: number;
  public patient_id!: number;
  public metric_type!: 'weight' | 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'cholesterol' | 'bmi';
  public value!: number;
  public unit!: string;
  public secondary_value!: number | null;
  public recorded_at!: Date;
  public notes!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initHealthMetricModel(sequelize: Sequelize): void {
  HealthMetric.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      metric_type: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      value: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      secondary_value: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      recorded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      notes: {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
    },
    {
      sequelize,
      tableName: 'health_metrics',
      modelName: 'HealthMetric',
    }
  );
}
