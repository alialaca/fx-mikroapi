const statusCodes = require('http-status-codes')
const CihazHareket = require('./cihaz_hareket.service')

const find = async (req, res) => {
    const kod = req.params.kod

    CihazHareket.find(kod)
        .then(data => {
            res.status(200).json({
                data
            })
        })
        .catch(error => {
            res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
                error: error.message
            })
        })
}


module.exports = {
    find
}
