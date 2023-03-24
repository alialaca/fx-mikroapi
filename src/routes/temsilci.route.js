const { Temsilci } = require('../controllers')

const router = require('express').Router()

router
    .get('/', Temsilci.list)

module.exports = router;
