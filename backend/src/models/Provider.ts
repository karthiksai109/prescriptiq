import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface ProviderAttributes {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  specialty: string;
  license_number: string;
  is_active: boolean;
}

interface ProviderCreationAttributes extends Optional<ProviderAttributes, 'id' | 'is_active'> {}

export class Provider extends Model<ProviderAttributes, ProviderCreationAttributes> implements ProviderAttributes {
  public id!: number;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public password_hash!: string;
  public specialty!: string;
  public license_number!: string;
  public is_active!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initProviderModel(sequelize: Sequelize): void {
  Provider.init(
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
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      specialty: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      license_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'providers',
      modelName: 'Provider',
    }
  );
}
