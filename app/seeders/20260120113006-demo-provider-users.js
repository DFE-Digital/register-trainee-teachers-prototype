const { v4: uuidv4 } = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.bulkDelete('provider_users', null, { transaction })

      const providers = await queryInterface.sequelize.query(
        'SELECT id FROM providers',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      )
      const users = await queryInterface.sequelize.query(
        'SELECT id FROM users',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      )

      if (providers.length === 0 || users.length === 0) {
        await transaction.commit()
        return
      }

      const createdAt = new Date()
      const systemUserId = users[0].id
      const providerId = providers[0].id

      const providerUsers = users.slice(0, 2).map(user => ({
        id: uuidv4(),
        provider_id: providerId,
        user_id: user.id,
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
