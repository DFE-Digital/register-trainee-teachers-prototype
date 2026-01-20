const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Wire up User associations.
     * @param {object} models
     */
    static associate(models) {
      /**
       * One user → many UserRevision rows (revision history).
       * FK lives on UserRevision.userId.
       */
      User.hasMany(models.UserRevision, {
        foreignKey: 'userId',
        as: 'revisions'
      })

      /**
       * One user → many ProviderUser rows (membership links).
       * FK lives on ProviderUser.userId.
       */
      User.hasMany(models.ProviderUser, {
        foreignKey: 'userId',
        as: 'providerUsers'
      })

      /**
       * Users ↔ providers via ProviderUser join rows.
       */
      User.belongsToMany(models.Provider, {
        through: models.ProviderUser,
        foreignKey: 'userId',
        otherKey: 'providerId',
        as: 'providers'
      })

      /**
       * User was created by another User.
       * FK lives on User.createdById.
       */
      User.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdByUser'
      })

      /**
       * User was last updated by another User.
       * FK lives on User.updatedById.
       */
      User.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedByUser'
      })

      /**
       * User was deleted by another User.
       * FK lives on User.deletedById.
       */
      User.belongsTo(models.User, {
        foreignKey: 'deletedById',
        as: 'deletedByUser'
      })
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name',
        validate: {
          notEmpty: true
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name',
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'bat'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lastSignedInAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_signed_in_at'
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
      modelName: 'User',
      tableName: 'users',
      timestamps: true
    }
  )

  const revisionHook = require('../hooks/revisionHook')

  User.addHook('afterCreate', (instance, options) =>
    revisionHook({ revisionModelName: 'UserRevision', modelKey: 'user' })(instance, {
      ...options,
      hookName: 'afterCreate'
    })
  )

  User.addHook('afterUpdate', (instance, options) => {
    const hookName = instance.deletedById !== null ? 'afterDestroy' : 'afterUpdate'
    revisionHook({ revisionModelName: 'UserRevision', modelKey: 'user' })(instance, {
      ...options,
      hookName
    })
  })

  return User
}
