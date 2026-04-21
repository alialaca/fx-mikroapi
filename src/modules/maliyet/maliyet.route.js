const Maliyet = require('./maliyet.controller')
const Validation = require('./maliyet.validation')
const validate = require('../../middlewares/validate')


const router = require('express').Router()

router
    .get('/', Maliyet.list)
    .post('/', validate(Validation.create), Maliyet.create)
    .patch('/:id', validate(Validation.update), Maliyet.update)
    .delete('/:id', validate(Validation.remove), Maliyet.remove)

module.exports = router;