const Rapor = require('./rapor.controller')

const router = require('express').Router()

router
    .get('/stok-durum', Rapor.stokDurum)

module.exports = router;