const OdemePlan = require('./odeme_plan.controller')

const router = require('express').Router()

router
    .get('/', OdemePlan.list)

module.exports = router;
