const statusCodes = require('http-status-codes')
const { Depo } = require('../services')
const list = async (req, res) => {
    const depolar = await Depo.list()
    res.status(statusCodes.OK).json({
        data: depolar
    })
}

module.exports = {
    list
}
