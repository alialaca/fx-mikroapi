const statusCodes = require('http-status-codes')
const Fatura = require('./fatura.service')

const kaydet = async (req, res, next) => {
    Fatura.kaydet(req.body)
        .then(data => {
            res.status(statusCodes.OK).json({ data })
        })
        .catch(next)
}

module.exports = { kaydet }
