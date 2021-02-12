const express = require('express')
const router = express.Router()
const knex = require('../db')
const { getUser } = require('../utils/user')

router.get('/me', async (req, res) => {
  const user = await getUser(req)

  res.send({
    id: user.id,
    name: user.name,
    role: user.role
  })
})

router.put('/profile', async (req, res) => {
  const { body, user } = req

  const authorizedParams = ['name']

  const params = authorizedParams.reduce((obj, param) => {
    if (body[param]) {
      obj[param] = body[param]
    }

    return obj
  }, {})

  await knex('users').where({ id: user.id }).update(params)

  res.sendStatus(200)
})

router.delete('/profile', async (req, res) => {
  const { user } = req

  await knex('users').where({ id: user.id }).del()

  req.logout()
  req.session.destroy()

  res.clearCookie('connect.sid', {
    path: '/'
  }).clearCookie('park_manager_token', {
    path: '/'
  }).sendStatus(200)
})

module.exports = router