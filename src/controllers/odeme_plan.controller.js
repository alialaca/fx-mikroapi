const statusCodes = require('http-status-codes')
const { OdemePlan } = require('../services')
const list = async (req, res) => {
    const records = await OdemePlan.list()
    res.status(statusCodes.OK).json({
        data: records
    })
}

module.exports = {
    list
}
