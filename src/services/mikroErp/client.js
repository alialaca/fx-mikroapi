const axios = require('axios')
const crypto = require('crypto')
const dayjs = require('dayjs')
const ApiError = require('../../utils/ApiError')
const logger = require('../../utils/logger')
const config = require('./config')

const http = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeoutMs,
    headers: { 'Content-Type': 'application/json' }
})

const computeSifre = () =>
    crypto.createHash('md5')
        .update(`${dayjs().format('YYYY-MM-DD')} ${config.sifre}`)
        .digest('hex')

const buildEnvelope = (payload = {}) => {
    const { Mikro: mikroExtras = {}, ...root } = payload
    return {
        Mikro: {
            FirmaKodu: config.firmaKodu,
            CalismaYili: config.calismaYili,
            KullaniciKodu: config.kullaniciKodu,
            ApiKey: config.apiKey,
            Sifre: computeSifre(),
            ...mikroExtras
        },
        ...root
    }
}

const callApi = async (methodName, payload = {}) => {
    const url = `${config.methodBasePath}/${methodName}`
    try {
        const res = await http.post(url, buildEnvelope(payload))
        logger.info({ scope: 'mikroErp.call', method: methodName, status: res.status })
        return res.data
    } catch (err) {
        const status = err.response?.status || 502
        const detail = err.response?.data?.message || err.response?.data || err.message
        logger.error({ scope: 'mikroErp.call', method: methodName, status, detail })
        throw new ApiError(status, `Mikro ERP ${methodName} başarısız: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
    }
}

module.exports = { callApi }
