import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface PatientAttributes {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: Date;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  blood_type: string;
  allergies: string[];
  medical_conditions: string[];
  provider_id: number;
  phone: string;
  is_active: boolean;
}

interface PatientCreationAttributes extends Optional<PatientAttributes, 'id' | 'allergies' | 'medical_conditions' | 'is_active'> {}

export class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: number;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public date_of_birth!: Date;
  public gender!: 'male' | 'female' | 'other';
  public height_cm!: number;
  public weight_kg!: number;
  public blood_type!: string;
  public allergies!: string[];
  public medical_conditions!: string[];
  public provider_id!: number;
  public phone!: string;
  public is_active!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Computed BMI
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  get bmi(): number {
    const heightM = this.height_cm / 100;
    return parseFloat((this.weight_kg / (heightM * heightM)).toFixed(1));
  }

  get bmiCategory(): string {
    const bmi = this.bmi;
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obese Class I';
    if (bmi < 40) return 'Obese Class II';
    return 'Obese Class III';
  }
}

export function initPatientModel(sequelize: Sequelize): void {
  Patient.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      height_cm: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 50, max: 300 },
      },
      weight_kg: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 20, max: 500 },
      },
      blood_type: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      allergies: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const val = this.getDataValue('allergies');
          if (typeof val === 'string') return JSON.parse(val);
          return val || [];
        },
      },
      medical_conditions: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const val = this.getDataValue('medical_conditions');
          if (typeof val === 'string') return JSON.parse(val);
          return val || [];
        },
      },
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'patients',
      modelName: 'Patient',
    }
  );
}
