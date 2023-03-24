const statusCodes = require('http-status-codes')
const { Cari, CariHareket } = require('../services')
const list = async (req, res) => {
    const temsilci = req.query?.temsilci?.split('-')

    const cari = await Cari.list(temsilci, req.paginationOptions)
    res.status(statusCodes.OK).json({
        meta: {
            pagination: req.paginationOptions,
        },
        data: cari
    })
}

const hareketler = async (req, res) => {
    const records = await CariHareket.find(req.params.kod)

    res.status(statusCodes.OK).json({
        data: records
    })
}

module.exports = {
    list,
    hareketler
}
