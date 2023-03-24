const statusCodes = require('http-status-codes')
const { Temsilci } = require('../services')
const list = async (req, res) => {
    const temsilciler = await Temsilci.list()
    res.status(statusCodes.OK).json({
        data: temsilciler
    })
}

module.exports = {
    list
}
