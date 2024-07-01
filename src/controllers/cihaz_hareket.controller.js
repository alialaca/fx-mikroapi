const statusCodes = require('http-status-codes')
const {CihazHareket} = require('../services')

const find = async (req, res) => {
    const kod = req.params.kod

    CihazHareket.find(kod)
        .then(data => {
            res.status(200).json({
                data
            })
        })
        .catch(error => {
            res.status(500).json({
                error: error.message
            })
        })
}


module.exports = {
    find
}
