const Joi = require('joi')

const detail = {
    params: Joi.object().keys({
        id: Joi.number().required()
    })
}

module.exports = {
    detail
}