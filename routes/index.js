const express = require('express')
const router = express.Router()
const passport = require('passport')

router.use('/auth', require('./auth'))
router.use('/spots', require('./spots'))
router.use('/user', passport.authenticate('jwt'), require('./user'))

module.exports = router