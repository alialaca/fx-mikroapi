const statusCodes = require('http-status-codes')
const {Rapor} = require('../services')

const stokDurum = async (req, res, next) => {
    const tableName = 'CRM_STOK_DURUM_OZET'
    Rapor.list(tableName)
        .then( data => {
            res.status(statusCodes.OK).json({
                data
            })
        })
        .catch(next)
}

module.exports = {
    stokDurum
}