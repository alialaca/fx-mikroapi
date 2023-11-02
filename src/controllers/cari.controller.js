const statusCodes = require('http-status-codes')
const { Cari, CariHareket } = require('../services')
const list = async (req, res, next) => {
    const temsilci = req.query?.temsilci?.split('-')
    req.paginationOptions.search= req.query.search || ''

    Cari.list(temsilci, req.paginationOptions)
        .then( cari => {
            res.status(statusCodes.OK).json({
                meta: {
                    pagination: {
                        ...req.paginationOptions,
                        total: cari.count
                    }
                },
                data: cari.data
            })
        }).catch( error => {
            console.log('Hata')
            console.log(error)
             next(error)
    })
}

const find = async (req, res, next) => {
    const { kod } = req.params

    Cari.find(kod)
        .then( cari => {
            res.status(statusCodes.OK).json({
                data: cari
            })
        }).catch( next )
}

const hareketler = async (req, res) => {
    const records = await CariHareket.find(req.params.kod)

    res.status(statusCodes.OK).json({
        data: records
    })
}

module.exports = {
    list,
    hareketler,
    find
}
