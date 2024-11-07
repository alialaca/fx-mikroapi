const statusCodes = require('http-status-codes')
const { FiyatListe } = require('../services')

const list = async (req, res, next) => {
    FiyatListe.list()
        .then( fiyatListe => {
            res.status(statusCodes.OK).json({
                data: fiyatListe
            })
        }).catch( next )
}

const find = async (req, res) =>
{
    const result = await FiyatListe.find(req.params?.id)

    res.status(200).json({
        data: result
    })
}

module.exports = {
    list,
    find
}