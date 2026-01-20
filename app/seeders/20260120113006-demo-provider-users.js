const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.bulkDelete('provider_users', null, { transaction })

      const dataPath = path.join(__dirname, '/data/20260120113006-demo-provider-users.json')
      const rawData = fs.readFileSync(dataPath, 'utf8')
      const providerUsersData = JSON.parse(rawData)

      if (providerUsersData.length === 0) {
        await transaction.commit()
        return
      }

      const providerIds = [...new Set(
        providerUsersData.map(providerUser => providerUser.providerId)
      )]
      const userIds = [...new Set([
        ...providerUsersData.map(providerUser => providerUser.userId),
        '354751f2-c5f7-483c-b9e4-b6103f50f970'
      ])]
      const providers = await queryInterface.sequelize.query(
        'SELECT id FROM providers WHERE id IN (:ids)',
        {
          replacements: { ids: providerIds },
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction
        }
      )
      const users = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE id IN (:ids)',
        {
          replacements: { ids: userIds },
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction
        }
      )

      if (providers.length === 0 || users.length === 0) {
        await transaction.commit()
        return
      }

      const createdAt = new Date()
      const providerById = providers.reduce((acc, provider) => {
        acc[provider.id] = provider.id
        return acc
      }, {})
      const userById = users.reduce((acc, user) => {
        acc[user.id] = user.id
        return acc
      }, {})

      const systemUserId = userById['354751f2-c5f7-483c-b9e4-b6103f50f970']
      const missingAssociation = providerUsersData.find(({ userId, providerId }) => (
        !userById[userId] || !providerById[providerId]
      ))

      if (!systemUserId || missingAssociation) {
        await transaction.commit()
        return
      }

      const providerUsers = providerUsersData.map(({ userId, providerId }) => ({
        id: uuidv4(),
        provider_id: providerById[providerId],
        user_id: userById[userId],
        created_at: createdAt,
        created_by_id: systemUserId,
        updated_at: createdAt,
        updated_by_id: systemUserId
      }))

      await queryInterface.bulkInsert('provider_users', providerUsers, { transaction })

      await transaction.commit()
    } catch (error) {
      console.error('Provider user seeding error:', error)
      await transaction.rollback()
      throw error
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('provider_users', null, {})
  }
}
