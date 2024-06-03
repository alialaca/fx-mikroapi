const { Rapor} = require('../controllers')

const router = require('express').Router()

router
    .get('/stok-durum', Rapor.stokDurum)

module.exports = router;