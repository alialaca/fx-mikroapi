const Satis = require('./satis.controller')
const SatisValidation = require('./satis.validation')
const validate = require('../../middlewares/validate')

const router = require('express').Router()

router
    .get('/', validate(SatisValidation.liste), Satis.liste)
    .get('/ozet', validate(SatisValidation.ozet), Satis.ozet)
    .get('/prim', validate(SatisValidation.prim), Satis.prim)

module.exports = router;
