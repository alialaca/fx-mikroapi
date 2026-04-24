const { callApi } = require('./client')
const cari = require('./endpoints/cari')
const fatura = require('./endpoints/fatura')

module.exports = {
    callApi,
    cari,
    fatura
}
