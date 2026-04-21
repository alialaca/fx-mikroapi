const Tahsilat = require('./tahsilat.controller')
const TahsilatValidation = require('./tahsilat.validation')
const validate = require('../../middlewares/validate')

const router = require('express').Router()

router
    .get('/', validate(TahsilatValidation.filter), Tahsilat.list)
    .post('/', validate(TahsilatValidation.create), Tahsilat.create)
    .get('/:id', Tahsilat.find)
    .delete('/:id', validate(TahsilatValidation.remove), Tahsilat.remove)

module.exports = router;