const statusCodes = require('http-status-codes')
const {Maliyet, Stok} = require('../services')

const list = async (req, res, next) => {
    Maliyet.list()
        .then( maliyet => {
            res.status(200).json({
                data:maliyet
            })
        })
        .catch(next)
}

const create = async (req, res) => {
    const {stok_kod, baslangic_tarihi, maliyet} = req.body
    const data = await Maliyet.create({stok_kod, baslangic_tarihi, maliyet})
    res.status(statusCodes.CREATED).json({
        data
    })
}

const update = async (req, res) => {
    console.log('endpoint')
    const {id} = req.params
    const {stok_kod, baslangic_tarihi, maliyet} = req.body
    const data = await Maliyet.update({id, stok_kod, baslangic_tarihi, maliyet})
    res.status(statusCodes.OK).json({
        data
    })
}

const remove = async (req, res) => {
    const {id} = req.params
    //TODO: eğer kayıt yoksa hata döndürmekte ve uygulama durmakta. Düzeltilecek.
    const data = await Maliyet.remove(id)
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