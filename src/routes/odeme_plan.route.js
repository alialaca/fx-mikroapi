const { OdemePlan } = require('../controllers')

const router = require('express').Router()

router
    .get('/', OdemePlan.list)

module.exports = router;
