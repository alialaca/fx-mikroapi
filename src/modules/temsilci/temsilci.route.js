const Temsilci = require('./temsilci.controller')

const router = require('express').Router()

router
    .get('/', Temsilci.list)

module.exports = router;
