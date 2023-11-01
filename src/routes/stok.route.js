const { Stok } = require('../controllers')
const {filter} = require('../validations').Stok
const validate = require('../middlewares/validate')

const router = require('express').Router()

router
    .get('/', validate(filter), Stok.list)
    .get('/:kod', validate(filter), Stok.find)

module.exports = router;
