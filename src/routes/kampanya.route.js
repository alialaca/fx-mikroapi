const { Kampanya, Maliyet, Siparis} = require('../controllers')
const Validation = require('../validations').Kampanya
const validate = require('../middlewares/validate')
const {Siparis: SiparisValidation} = require("../validations");


const router = require('express').Router()

router
    .get('/', Kampanya.list)
    .post('/', validate(Validation.create), Kampanya.create)
    .get('/:id', validate(Validation.detail), Kampanya.find)
    .delete('/:id', validate(Validation.detail), Kampanya.remove)

module.exports = router;