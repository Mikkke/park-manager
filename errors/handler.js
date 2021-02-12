module.exports = (err, res) => {
  res.status(409).send({
    code: err.code,
    message: err.detail || err.message
  })
}