const Joi = require('joi')
const dayjs = require('dayjs')

const filter = {
    query: Joi.object().keys({
        temsilci: Joi.string(),
        cari: Joi.string(),
        firstDate: Joi.date().default('2020-01-01'),
        lastDate: Joi.date().default(dayjs('2099-01-01').format('YYYY-MM-DD')),
        page: Joi.number().default(1),
        limit: Joi.number().default(20),
        search: Joi.string().default(''),
        durum: Joi.string().allow('Açık', 'Kapalı').optional()
    })
}

const detail = {
    params: Joi.object().keys({
        seri: Joi.string().default(''),
        sira: Joi.number().required(),
        temsilci: Joi.string()
    })
}

const create = {
    body: Joi.object().keys({
        evrak_seri: Joi.string().empty(['', null]).default(''),
        olusturan: Joi.number().required(),
        temsilci: Joi.string().required(),
        cari: Joi.string().required(),
        odemeplan: Joi.number().required(),
        depo: Joi.number().required().default(1),
        doviz_cinsi: Joi.number().default(0),
        proje: Joi.string().empty(['', null]).default(''),
        stoklar: Joi.array().min(1).items({
            stok: Joi.string().required(),
            miktar: Joi.number().required().min(0),
            birim_fiyat: Joi.number().precision(3),
            iskonto: Joi.number().min(0).default(0),
            vergi: Joi.number(),
            aciklama: Joi.string().empty(['', null]).default("")
        }).required(),
        notlar: Joi.array().max(10).items(Joi.string().max(127)),
        ortaklar: Joi.array().allow(null).items({
            temsilci_kod: Joi.string().required(),
            satis_oran: Joi.number().min(0).max(1).default(0.5)
        })
    })
}

module.exports = {
    filter,
    detail,
    create
}
