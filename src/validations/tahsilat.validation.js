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
        search: Joi.string().default('')
    })
}

const create = {
    body: Joi.object().keys({
        cari_kod: Joi.string().required(),
        aciklama: Joi.string().required(),
        tutar: Joi.number().required(),
        vade: Joi.string().length(8).required(),
    })
}

const remove = {
    params: Joi.object().keys({
        id: Joi.string().uuid().required()
    })
}

module.exports = {
    filter,
    create
}
