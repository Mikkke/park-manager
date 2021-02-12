const knex = require('../db')

module.exports.getUser = async (req) => {
  const users = await knex('users').where({ id: req.user.id }).returning('*')
  const user = users[0]

  return user
}