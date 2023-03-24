const { Depo } = require('../controllers')

const router = require('express').Router()

router
    .get('/', Depo.list)

module.exports = router;
