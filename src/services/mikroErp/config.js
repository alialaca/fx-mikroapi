const ApiError = require('../../utils/ApiError')

const required = (name) => {
    const v = process.env[name]
    if (!v) throw new ApiError(500, `Eksik env değişkeni: ${name}`)
    return v
}

const optional = (name, fallback = '') => process.env[name] ?? fallback

const toInt = (v, fallback = 0) => {
    const n = parseInt(v, 10)
    return Number.isFinite(n) ? n : fallback
}

module.exports = {
    baseURL: required('MIKRO_ERP_API_URL').replace(/\/+$/, ''),
    kullaniciKodu: required('MIKRO_ERP_KULLANICI_KODU'),
    sifre: required('MIKRO_ERP_SIFRE'),
    apiKey: required('MIKRO_ERP_API_KEY'),
    firmaKodu: optional('MIKRO_ERP_FIRMA_KODU', 'FIXPRO'),
    calismaYili: optional('MIKRO_ERP_CALISMA_YILI', String(new Date().getFullYear())),
    timeoutMs: toInt(optional('MIKRO_ERP_TIMEOUT_MS'), 30000),
    methodBasePath: '/Api/APIMethods'
}
