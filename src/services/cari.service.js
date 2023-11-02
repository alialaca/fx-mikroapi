const { Cari } = require('../models')
class CariService {
    constructor() {

    }

    async list(temsilci, {page, limit, search}){
        // TODO: Pormise.all gibi bir yapı ile kontrol edilecek.

        const data = await Cari.list(temsilci, {page, limit, search})
        const count = await Cari.listCount(temsilci, search)
        return Promise.resolve({data, count})
    }

    async find(kod) {
        return Cari.find(kod)
    }
}

module.exports = new CariService()
