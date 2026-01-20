const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class Provider extends Model {
    /**
     * Wire up Provider associations.
     * @param {object} models
     */
    static associate(models) {
      /**
       * One provider → many ProviderRevision rows (revision history).
       * FK lives on ProviderRevision.providerId.
       */
      Provider.hasMany(models.ProviderRevision, {
        foreignKey: 'providerId',
        as: 'revisions'
      })

      /**
       * One provider → many ProviderUser rows (membership links).
       * FK lives on ProviderUser.providerId.
       */
      Provider.hasMany(models.ProviderUser, {
        foreignKey: 'providerId',
        as: 'providerUsers'
      })

      /**
       * Providers ↔ users via ProviderUser join rows.
       */
      Provider.belongsToMany(models.User, {
        through: models.ProviderUser,
        foreignKey: 'providerId',
        otherKey: 'userId',
        as: 'users'
      })

      /**
       * Provider was created by a User.
       * FK lives on Provider.createdById.
       */
      Provider.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdByUser'
      })

      /**
       * Provider was last updated by a User.
       * FK lives on Provider.updatedById.
       */
      Provider.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedByUser'
      })

      /**
       * Provider was archived by a User.
       * FK lives on Provider.archivedById.
       */
      Provider.belongsTo(models.User, {
        foreignKey: 'archivedById',
        as: 'archivedByUser'
      })

      /**
       * Provider was deleted by a User.
       * FK lives on Provider.deletedById.
       */
      Provider.belongsTo(models.User, {
        foreignKey: 'deletedById',
        as: 'deletedByUser'
      })
    }
  }

  Provider.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      operatingName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'operating_name',
        validate: {
          notEmpty: true
        }
      },
      legalName: {
        type: DataTypes.STRING,
        field: 'legal_name'
      },
      type: {
        type: DataTypes.ENUM('hei', 'other', 'school', 'scitt')
      },
      ukprn:  {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          is: /^1\d{7}$/
        }
      },
      urn:  {
        type: DataTypes.STRING,
        unique: true
      },
      code:  {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          is: /^[a-zA-Z0-9]{3}$/
        }
      },
      is_accredited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      website: {
        type: DataTypes.STRING,
        validate: {
          isURL: true
        }
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
      archivedAt: {
        type: DataTypes.DATE,
        field: 'archived_at'
      },
      archivedById: {
        type: DataTypes.UUID,
        field: 'archived_by_id'
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
      modelName: 'Provider',
      tableName: 'providers',
      timestamps: true
    }
  )

  const revisionHook = require('../hooks/revisionHook')

  Provider.addHook('afterCreate', (instance, options) =>
    revisionHook({ revisionModelName: 'ProviderRevision', modelKey: 'provider' })(instance, {
      ...options,
      hookName: 'afterCreate'
    })
  )

  Provider.addHook('afterUpdate',
    revisionHook({ revisionModelName: 'ProviderRevision', modelKey: 'provider' })
  )

  return Provider
}
