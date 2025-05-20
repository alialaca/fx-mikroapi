const { Cari } = require('../controllers')
const validate = require('../middlewares/validate')
const cariValidation = require('../validations/cari.validation')

const router = require('express').Router()

router
    .get('/', Cari.list)
    .post('/', validate(cariValidation.create), Cari.create)
    .get('/:kod', Cari.find)
    .get('/:kod/hareketler', Cari.hareketler)
    .get('/:kod/hareketler/:faturaId', Cari.hareket)

module.exports = router;
