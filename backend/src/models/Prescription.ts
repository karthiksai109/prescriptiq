import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface PrescriptionAttributes {
  id: number;
  patient_id: number;
  provider_id: number;
  medication_id: number;
  dosage: string;
  frequency: string;
  duration_weeks: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  start_date: Date;
  end_date: Date | null;
  personalization_score: number;
  personalization_factors: object;
  notes: string;
  refills_remaining: number;
}

interface PrescriptionCreationAttributes extends Optional<PrescriptionAttributes, 'id' | 'end_date' | 'personalization_score' | 'personalization_factors' | 'notes' | 'refills_remaining' | 'status'> {}

export class Prescription extends Model<PrescriptionAttributes, PrescriptionCreationAttributes> implements PrescriptionAttributes {
  public id!: number;
  public patient_id!: number;
  public provider_id!: number;
  public medication_id!: number;
  public dosage!: string;
  public frequency!: string;
  public duration_weeks!: number;
  public status!: 'active' | 'completed' | 'paused' | 'cancelled';
  public start_date!: Date;
  public end_date!: Date | null;
  public personalization_score!: number;
  public personalization_factors!: object;
  public notes!: string;
  public refills_remaining!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initPrescriptionModel(sequelize: Sequelize): void {
  Prescription.init(
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
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      medication_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dosage: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      frequency: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      duration_weeks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 104 },
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      personalization_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: { min: 0, max: 100 },
      },
      personalization_factors: {
        type: DataTypes.JSON,
        defaultValue: {},
        get() {
          const val = this.getDataValue('personalization_factors');
          if (typeof val === 'string') return JSON.parse(val);
          return val || {};
        },
      },
      notes: {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
      refills_remaining: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'prescriptions',
      modelName: 'Prescription',
    }
  );
}
