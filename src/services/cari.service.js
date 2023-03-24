const { Cari } = require('../models')
class CariService {
    constructor() {

    }

    list(temsilci, {page, limit}){
        return Cari.list(temsilci, {page, limit})
    }
}

module.exports = new CariService()
