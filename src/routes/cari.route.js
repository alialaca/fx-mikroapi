const { Cari } = require('../controllers')

const router = require('express').Router()

router
    .get('/', Cari.list)
    .get('/:kod', Cari.find)
    .get('/:kod/hareketler', Cari.hareketler)
    .get('/:kod/hareketler/:faturaId', Cari.hareket)

module.exports = router;
