const Joi = require('joi')
const dayjs = require('dayjs')

const validGroups = ['marka', 'bolge', 'anagrup', 'odeme', 'temsilci_isim']

const liste = {
    query: Joi.object().keys({
        firstDate: Joi.date().default(dayjs('2024-01-01').toISOString()),
        lastDate: Joi.date().default(dayjs('2030-12-31').toISOString()),
        kar: Joi.boolean().default(false),
    })
}

const ozet = {
    query: Joi.object().keys({
        yil: Joi.string().length(4).default(dayjs().format('YYYY')),
        type: Joi.string().valid(...validGroups),
        temsilci: Joi.string(),
        cari_kod: Joi.string().allow(null, '')
    })
}

const prim = {
    query: Joi.object().keys({
        temsilci: Joi.string()
    })
}

module.exports = {
    liste,
    ozet,
    prim
}
