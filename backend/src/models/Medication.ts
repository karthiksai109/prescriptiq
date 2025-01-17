import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface MedicationAttributes {
  id: number;
  name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  description: string;
  dosage_forms: string[];
  contraindications: string[];
  side_effects: string[];
  weight_loss_applicable: boolean;
  min_bmi_threshold: number | null;
  requires_monitoring: boolean;
}

interface MedicationCreationAttributes extends Optional<MedicationAttributes, 'id' | 'dosage_forms' | 'contraindications' | 'side_effects' | 'weight_loss_applicable' | 'min_bmi_threshold' | 'requires_monitoring'> {}

export class Medication extends Model<MedicationAttributes, MedicationCreationAttributes> implements MedicationAttributes {
  public id!: number;
  public name!: string;
  public generic_name!: string;
  public brand_name!: string;
  public category!: string;
  public description!: string;
  public dosage_forms!: string[];
  public contraindications!: string[];
  public side_effects!: string[];
  public weight_loss_applicable!: boolean;
  public min_bmi_threshold!: number | null;
  public requires_monitoring!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initMedicationModel(sequelize: Sequelize): void {
  Medication.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
      },
      generic_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      brand_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      dosage_forms: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const val = this.getDataValue('dosage_forms');
          if (typeof val === 'string') return JSON.parse(val);
          return val || [];
        },
      },
      contraindications: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const val = this.getDataValue('contraindications');
          if (typeof val === 'string') return JSON.parse(val);
          return val || [];
        },
      },
      side_effects: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const val = this.getDataValue('side_effects');
          if (typeof val === 'string') return JSON.parse(val);
          return val || [];
        },
      },
      weight_loss_applicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      min_bmi_threshold: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      requires_monitoring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'medications',
      modelName: 'Medication',
    }
  );
}
