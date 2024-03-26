const { Stok,  Maliyet } = require('../controllers')
const {filter, maliyet} = require('../validations').Stok
const validate = require('../middlewares/validate')

const router = require('express').Router()

router
    .get('/', validate(filter), Stok.list)
    .get('/:kod', validate(filter), Stok.find)

module.exports = router;
