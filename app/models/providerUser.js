const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class ProviderUser extends Model {
    static associate(models) {
      /**
       * ProviderUser belongs to a Provider.
       * FK lives on ProviderUser.providerId.
       */
      ProviderUser.belongsTo(models.Provider, {
        foreignKey: 'providerId',
        as: 'provider'
      })

      /**
       * ProviderUser belongs to a User.
       * FK lives on ProviderUser.userId.
       */
      ProviderUser.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      })

      /**
       * ProviderUser was created by a User.
       * FK lives on ProviderUser.createdById.
       */
      ProviderUser.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdByUser'
      })

      /**
       * ProviderUser was last updated by a User.
       * FK lives on ProviderUser.updatedById.
       */
      ProviderUser.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedByUser'
      })

      /**
       * ProviderUser was deleted by a User.
       * FK lives on ProviderUser.deletedById.
       */
      ProviderUser.belongsTo(models.User, {
        foreignKey: 'deletedById',
        as: 'deletedByUser'
      })
    }
  }

  ProviderUser.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'provider_id'
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      createdById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by_id'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      },
      updatedById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'updated_by_id'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      },
      deletedById: {
        type: DataTypes.UUID,
        field: 'deleted_by_id'
      }
    },
    {
      sequelize,
      modelName: 'ProviderUser',
      tableName: 'provider_users',
      timestamps: true
    }
  )

  return ProviderUser
}
