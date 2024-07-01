const { CihazHareket,  Maliyet } = require('../controllers')

const router = require('express').Router()

router
    .get('/:kod', CihazHareket.find)

module.exports = router;
