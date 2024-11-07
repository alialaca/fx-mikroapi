const router = require('express').Router()
const { FiyatListe } = require('../controllers')
const { validate} = require("../middlewares")
const FiyatListeValidation = require('../validations').FiyatListe

router
    .get('/', FiyatListe.list)
    .get('/:id', validate(FiyatListeValidation.detail), FiyatListe.find)

module.exports = router;