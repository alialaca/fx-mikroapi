const CihazHareket = require('./cihaz_hareket.controller')

const router = require('express').Router()

router
    .get('/:kod', CihazHareket.find)

module.exports = router;
