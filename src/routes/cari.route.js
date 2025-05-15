const { Cari } = require('../controllers')
const validate = require('../middlewares/validate')
const cariValidation = require('../validations/cari.validation')

const router = require('express').Router()

router
    .get('/', Cari.list)
    .post('/', validate(cariValidation.create), (req, res) => {
        console.log({ payload: req.body })
        return res.status(200).json({data: { kod: '120.19.999', unvan: req.bodu.unvan}})
    })
    .get('/:kod', Cari.find)
    .get('/:kod/hareketler', Cari.hareketler)
    .get('/:kod/hareketler/:faturaId', Cari.hareket)

module.exports = router;
