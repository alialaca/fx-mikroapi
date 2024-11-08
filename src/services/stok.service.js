const { Stok } = require('../models')
class StokService {
    constructor() {

    }

    async list({fields, page, limit, search}){
        const data = await Stok.list({fields, page, limit, search})
        const count = await Stok.listCount(search)
        return Promise.resolve({data, count})
    }

    async find(kod, {fields, temsilci}) {
        return Stok.find(kod, {fields, temsilci})
    }

    async update(kod, data) {
        return Stok.update(kod, data)
    }
}

module.exports = new StokService()
