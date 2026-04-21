const Cari = require('./cari.controller')
const cariValidation = require('./cari.validation')
const validate = require('../../middlewares/validate')

const router = require('express').Router()

router
    .get('/', Cari.list)
    .post('/', validate(cariValidation.create), Cari.create)
    .get('/:kod', Cari.find)
    .get('/:kod/hareketler', Cari.hareketler)
    .get('/:kod/hareketler/:faturaId', Cari.hareket)

module.exports = router;
