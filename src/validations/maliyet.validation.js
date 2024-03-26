const Joi = require('joi')

const validFields = ['miktar', 'siparis', 'kdv', 'fiyat']

const create = {
    body: Joi.object().keys({
        stok_kod: Joi.string().required(),
        maliyet: Joi.number().required(),
        baslangic_tarihi: Joi.date().required(),
    })
}

const update = {
    params: Joi.object().keys({
        id: Joi.number().required()
    }),
    body: Joi.object().keys({
        stok_kod: Joi.string(),
        maliyet: Joi.number(),
        baslangic_tarihi: Joi.date(),
    })
}

const remove = {
    params: Joi.object().keys({
        id: Joi.number().required()
    })
}


module.exports = {
    create,
    update,
    remove
}
