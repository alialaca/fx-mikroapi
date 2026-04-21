const Kampanya = require('./kampanya.controller')
const Validation = require('./kampanya.validation')
const validate = require('../../middlewares/validate')

const router = require('express').Router()

router
    .get('/', Kampanya.list)
    .post('/', validate(Validation.create), Kampanya.create)
    .get('/:id', validate(Validation.detail), Kampanya.find)
    .delete('/:id', validate(Validation.detail), Kampanya.remove)

module.exports = router;