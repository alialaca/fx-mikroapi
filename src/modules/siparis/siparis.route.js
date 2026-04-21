const Siparis = require('./siparis.controller')
const SiparisValidation = require('./siparis.validation')
const validate = require('../../middlewares/validate')

const router = require('express').Router()

router
    .get('/', validate(SiparisValidation.filter), Siparis.list)
    .post('/', validate(SiparisValidation.create), Siparis.create)
    .get('/:seri-:sira', validate(SiparisValidation.detail), Siparis.find)
    .get('/-:sira', validate(SiparisValidation.detail), Siparis.find)

module.exports = router;
