const dayjs = require('dayjs')
const { Siparis } = require('../models')
class SiparisService {
    constructor() {

    }

    list({cari, temsilci, firstDate, lastDate}, {page, limit}){

        const filter = {
            cari,
            temsilci,
            firstDate: dayjs(firstDate).toISOString(),
            lastDate: dayjs(lastDate).toISOString()
        }
        return Siparis.list(filter, {page, limit})
    }

    find(filter){
        return Siparis.find(filter)
    }
}

module.exports = new SiparisService()
