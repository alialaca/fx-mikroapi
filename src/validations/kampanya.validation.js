const Joi = require('joi')
const dayjs = require("dayjs");

const validFields = ['miktar', 'siparis', 'kdv', 'fiyat']

const create = {
    body: Joi.object().keys({
        isim: Joi.string().required(),
        aciklama: Joi.string().default('').optional(),
        baslangic_tarihi: Joi.date().required(),
        bitis_tarihi: Joi.date().required(),
        olusturan_kod: Joi.string().required(),
        limit: Joi.number().min(0),
        stoklar: Joi.array().min(1).items({
            stok_kod: Joi.string().required(),
            miktar: Joi.number().required().min(1),
            listefiyat: Joi.number().precision(3).required().min(0),
            fiyat: Joi.number().precision(3).required().min(0)
        }).required(),
        notlar: Joi.array().max(10).items(Joi.string().max(127))
    })
}

const detail = {
    params: Joi.object().keys({
        id: Joi.number().required()
    })
}


const remove = {
    params: Joi.object().keys({
        id: Joi.number().required()
    })
}


module.exports = {
    create,
    detail,
    remove
}
