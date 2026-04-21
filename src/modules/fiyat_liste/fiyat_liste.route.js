const router = require('express').Router()
const { validate} = require("../../middlewares")
const FiyatListe = require('./fiyat_liste.controller')
const FiyatListeValidation = require('./fiyat_liste.validation')

router
    .get('/', FiyatListe.list)
    .get('/:id', validate(FiyatListeValidation.detail), FiyatListe.find)

module.exports = router;