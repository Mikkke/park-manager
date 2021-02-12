const { getUser } = require('../utils/user')

module.exports = async (req, res, next) => {
  if (req.user) {
    const user = await getUser(req)

    if (user.role === 'admin') {
      next()

      return
    }
  } 
  
  res.sendStatus(401)
}