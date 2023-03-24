const { Siparis } = require('../controllers')
const validate = require('../middlewares/validate')
const SiparisValidation = require('../validations').Siparis

const router = require('express').Router()

router
    .get('/', validate(SiparisValidation.filter), Siparis.list)
    .get('/:seri-:sira', validate(SiparisValidation.detail), Siparis.detay)
    .get('/-:sira', validate(SiparisValidation.detail), Siparis.detay)

module.exports = router;
