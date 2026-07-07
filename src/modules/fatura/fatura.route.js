const Fatura = require('./fatura.controller')
const faturaValidation = require('./fatura.validation')
const validate = require('../../middlewares/validate')

const router = require('express').Router()

router
    .post('/', validate(faturaValidation.kaydet), Fatura.kaydet)

module.exports = router
