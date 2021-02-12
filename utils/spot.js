const knex = require('../db')

module.exports.isAvailable = async (id) => {
  const users = await knex('users').where({ spot_id: id }).returning('*')
  const isAvailable = users.length === 0

  return isAvailable
}