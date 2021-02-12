const bcrypt = require('bcrypt')

module.exports = async (knex) => {
  await knex('users').insert([
    {
      email: 'admin@mail.com',
      name: 'admin',
      role: 'admin',
      password: await bcrypt.hash('adminpassword', 10)
    }
  ]).onConflict('email').ignore()

  await knex('spots').insert([
    {
      number: 1,
      floor: '1',
      occupancyTime: 60 * 60 * 1000
    },
    {
      number: 2,
      floor: '1',
      occupancyTime: 60 * 60 * 1000
    },
    {
      number: 3,
      floor: '2',
      occupancyTime: 60 * 60 * 1000
    },
    {
      number: 4,
      floor: '2',
      occupancyTime: 60 * 60 * 1000
    },
    {
      number: 5,
      floor: '2',
      occupancyTime: 60 * 60 * 1000
    }
  ]).onConflict('number').ignore()
}