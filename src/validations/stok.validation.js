const Joi = require('joi')

const validFields = ['miktar', 'siparis', 'kdv', 'fiyat', 'maliyet']

const filter = {
    query: Joi.object().keys({
        project: Joi.alternatives(
            Joi.string().valid(...validFields),
            Joi.array().items(Joi.string().valid(...validFields))
        ),
        page: Joi.number().default(1),
        limit: Joi.number().default(20),
        search: Joi.string().allow('').optional().default('')
    })
}

module.exports = {
    filter
}
