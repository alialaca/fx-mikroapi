const statusCodes = require('http-status-codes')
const {Aykur} = require('../services')
const list = async (req, res) => {
    const kurlar = await Aykur.list()
    res.status(statusCodes.OK).json({
        data: kurlar
    })
}

const create = async (req, res) => {
    const {body} = req
    const {baslangic_tarihi, kur} = body
    const data = await Aykur.create({baslangic_tarihi, kur})
    res.status(statusCodes.CREATED).json({
        data
    })
}

const update = async (req, res) => {
    const {id} = req.params
    const {baslangic_tarihi, kur} = req.body
    const data = await Aykur.update({id, baslangic_tarihi, kur})
    res.status(statusCodes.OK).json({
        data
    })
}

const remove = async (req, res) => {
    const {id} = req.params
    const data = await Aykur.remove(id)
    res.status(statusCodes.OK).json({
        data
    })
}

module.exports = {
    list,
    create,
    update,
    remove
}