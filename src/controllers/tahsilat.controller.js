const statusCodes = require('http-status-codes');
const { Tahsilat } = require('../services');

const notImplemented = function (req, res) {
    res.status(statusCodes.OK).json({
        message: 'Not implemented yet'
    })
}

const list = (req, res, next) => {
    const temsilci = req.query?.temsilci?.split('-')
    const cari = req.query?.cari?.split('-')
    const firstDate = req.query?.firstDate
    const lastDate = req.query?.lastDate

    Tahsilat.list({cari, temsilci, firstDate, lastDate}, req.paginationOptions)
        .then( tahsilat => {
            res.status(statusCodes.OK).json({
                meta: {
                    pagination: {
                        ...req.paginationOptions,
                        total: tahsilat.count
                    }
                },
                data: tahsilat.data
            })
        }).catch( next )
}

const find = notImplemented

const create = notImplemented

const remove = notImplemented

module.exports = {
    list,
    find,
    create,
    remove
}