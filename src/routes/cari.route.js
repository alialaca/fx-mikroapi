const { Cari } = require('../controllers')

const router = require('express').Router()

router
    .get('/', Cari.list)
    .get('/:kod', Cari.find)
    .get('/:kod/hareketler', Cari.hareketler)

module.exports = router;
