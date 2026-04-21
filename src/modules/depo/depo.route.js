const Depo = require('./depo.controller')

const router = require('express').Router()

router
    .get('/', Depo.list)

module.exports = router;
