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

module.exports = {
    filter
}
