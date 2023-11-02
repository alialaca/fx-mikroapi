const { Siparis } = require('../controllers')
const validate = require('../middlewares/validate')
const SiparisValidation = require('../validations').Siparis

const router = require('express').Router()

router
    .get('/', validate(SiparisValidation.filter), Siparis.list)
    .post('/', validate(SiparisValidation.create), Siparis.create)
    .get('/:seri-:sira', validate(SiparisValidation.detail), Siparis.find)
    .get('/-:sira', validate(SiparisValidation.detail), Siparis.find)

module.exports = router;
