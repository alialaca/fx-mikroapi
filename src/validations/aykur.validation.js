const Joi = require('joi')


const create = {
    body: Joi.object().keys({
        baslangic_tarihi: Joi.date().required(),
        kur: Joi.number().required()
    })
}

const update = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        baslangic_tarihi: Joi.date().required(),
        kur: Joi.number().required()
    })
}

const remove = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
}

module.exports = {
    create,
    update,
    remove
}
