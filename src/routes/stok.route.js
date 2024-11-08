const { Stok,  Maliyet } = require('../controllers')
const StokValidation = require('../validations').Stok
const validate = require('../middlewares/validate')

const router = require('express').Router()

router
    .get('/', validate(StokValidation.filter), Stok.list)
    .get('/:kod', validate(StokValidation.filter), Stok.find)
    .patch('/:kod', validate(StokValidation.update), Stok.update)

module.exports = router;
