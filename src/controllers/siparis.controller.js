const statusCodes = require('http-status-codes')
const { Siparis } = require('../services')
const list = async (req, res) => {
    const temsilci = req.query?.temsilci?.split('-')
    const cari = req.query?.cari?.split('-')
    const firstDate = req.query?.firstDate
    const lastDate = req.query?.lastDate

    const siparisler = await Siparis.list({cari, temsilci, firstDate, lastDate}, req.paginationOptions)
    res.status(statusCodes.OK).json({
        meta: {
            pagination: req.paginationOptions,
        },
        data: siparisler
    })
}

const detay = async (req, res) => {
    const result = await Siparis.find({
        serino: req.params?.seri,
        sirano: req.params?.sira
    },
        req.paginationOptions
    )

    res.status(200).json({
        data: result
    })
}

module.exports = {
    list,
    detay
}
