const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class ProviderRevision extends Model {
    static associate(models) {
      if (models.Provider) {
        ProviderRevision.belongsTo(models.Provider, {
          foreignKey: 'providerId',
          as: 'provider'
        })
      }
    }
  }

  ProviderRevision.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'provider_id'
      },
      operatingName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'operating_name'
      },
      legalName: {
        type: DataTypes.STRING,
        field: 'legal_name'
      },
      type: {
        type: DataTypes.ENUM('hei', 'other', 'school')
      },
      ukprn: {
        type: DataTypes.STRING,
        allowNull: false
      },
      urn: {
        type: DataTypes.STRING
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      website: {
        type: DataTypes.STRING
      },
      archivedAt: {
        type: DataTypes.DATE,
        field: 'archived_at'
      },
      archivedById: {
        type: DataTypes.UUID,
        field: 'archived_by_id'
      },
      revisionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'revision_number'
      },
      revisionAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'revision_at'
      },
      revisionById: {
        type: DataTypes.UUID,
        field: 'revision_by_id'
      }
    },
    {
      sequelize,
      modelName: 'ProviderRevision',
      tableName: 'provider_revisions',
      timestamps: false
    }
  )

  const activityHook = require('../hooks/activityHook')

  ProviderRevision.addHook('afterCreate', (instance, options) =>
    activityHook({
      entityType: 'provider',
      revisionTable: 'provider_revisions',
      entityIdField: 'providerId'
    })(instance, {
      ...options,
      hookName: 'afterCreate'
    })
  )

  return ProviderRevision
}
