const { callApi } = require('../client')

const asArray = (v) => (Array.isArray(v) ? v : [v])

const kaydet = (evraklar) =>
    callApi('FaturaKaydetV3', { Mikro: { evraklar: asArray(evraklar) } })

module.exports = { kaydet }
