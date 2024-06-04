const { Tahsilat } = require('../controllers')
const validate = require('../middlewares/validate')
const TahsilatValidation = require('../validations').Tahsilat

const router = require('express').Router()

router
    .get('/', validate(TahsilatValidation.filter), Tahsilat.list)
    .post('/', Tahsilat.create)
    .get('/:id', Tahsilat.find)
    .delete('/:id', Tahsilat.remove)

module.exports = router;