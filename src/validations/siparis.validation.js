const Joi = require('joi')
const dayjs = require('dayjs')

const filter = {
    query: Joi.object().keys({
        temsilci: Joi.string(),
        cari: Joi.string(),
        firstDate: Joi.date().default('2020-01-01'),
        lastDate: Joi.date().default(dayjs().format('YYYY-MM-DD')),
        page: Joi.number().default(1),
        limit: Joi.number().default(20)
    })
}

const detail = {
    params: Joi.object().keys({
        seri: Joi.string().default(''),
        sira: Joi.number().required()
    })
}

module.exports = {
    filter,
    detail
}
