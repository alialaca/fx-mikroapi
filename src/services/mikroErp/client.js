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
    let res
    try {
        res = await http.post(url, buildEnvelope(payload))
    } catch (err) {
        const status = err.response?.status || 502
        const detail = err.response?.data?.message || err.response?.data || err.message
        logger.error({ scope: 'mikroErp.call', method: methodName, status, detail })
        throw new ApiError(status, `Mikro ERP ${methodName} başarısız: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
    }

    logger.info({ scope: 'mikroErp.call', method: methodName, status: res.status })
    const first = res.data?.result?.[0]
    if (first && (first.IsError === true || (typeof first.StatusCode === 'number' && first.StatusCode >= 400))) {
        const msg = first.ErrorMessage || 'Bilinmeyen Mikro iş hatası'
        logger.error({ scope: 'mikroErp.call', method: methodName, status: first.StatusCode, detail: msg })
        throw new ApiError(first.StatusCode >= 400 && first.StatusCode < 600 ? first.StatusCode : 502, `Mikro ERP ${methodName}: ${msg}`)
    }
    return res.data
}

module.exports = { callApi }
