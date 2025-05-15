const Joi = require('joi')

const create = {
    body: Joi.object().keys({
        vkn: Joi.string().length(11).pattern(/^\d+$/).required(),
        unvan: Joi.string().required(),
        eposta: Joi.string().email().allow('', null),
        tel: Joi.string().required(),
        temsilci_kod: Joi.string().required(),
        grup_kod: Joi.string().default('SRV')
    })
}

module.exports = {
    create
}
