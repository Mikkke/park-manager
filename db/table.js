module.exports = async (knex) => {
  const hasSpotTable = await knex.schema.hasTable('spots')

  if (!hasSpotTable) {
    await knex.schema.createTable('spots', (table) => {
      table.increments()
      table.integer('number').unique()
      table.string('floor')
      table.integer('occupancyTime')
      table.timestamps(true, true)
    })
  }

  const hasUserTable = await knex.schema.hasTable('users')

  if (!hasUserTable) {
    await knex.schema.createTable('users', (table) => {
      table.increments()
      table.string('email').unique()
      table.string('name')
      table.string('password')
      table.string('role').defaultTo('public')
      table.timestamps(true, true)

      table.integer('spot_id').unsigned().index().references('id').inTable('spots').onDelete('SET NULL')
    })
  }
}