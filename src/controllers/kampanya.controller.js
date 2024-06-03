const statusCodes = require('http-status-codes')
const {Kampanya, Stok} = require('../services')

const list = async (req, res, next) => {
    Kampanya.list()
        .then( kampanyalar => {
            kampanyalar.forEach(kampanya => {
                kampanya.tutar = kampanya.stoklar.reduce((acc, stok) => acc + stok.fiyat * stok.miktar, 0)
            })
            res.status(200).json({
                data: kampanyalar
            })
        })
        .catch(next)
}

const find = async (req, res) => {
    const result = await Kampanya.find(req.params?.id)

    res.status(200).json({
        data: result
    })
}

const create = async (req, res) => {
    const {isim, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_kod, limit, stoklar, notlar} = req.body
    const data = await Kampanya.create({isim, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_kod, limit, stoklar, notlar: JSON.stringify(notlar)})
    res.status(statusCodes.CREATED).json({
        data
    })
}

const remove = async (req, res) => {
    const {id} = req.params
    const data = await Kampanya.remove(id)
    res.status(statusCodes.OK).json({
        data
    })
}

module.exports = {
    list,
    find,
    create,
    remove
}