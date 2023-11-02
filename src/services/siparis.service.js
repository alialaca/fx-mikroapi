const dayjs = require('dayjs')
const { Siparis, Cari} = require('../models')
class SiparisService {
    constructor() {

    }

    async list({cari, temsilci, firstDate, lastDate}, {page, limit, search}){

        const params = {
            search,
            cari,
            temsilci,
            firstDate: dayjs(firstDate).add(3, 'hour').toISOString(),
            lastDate: dayjs(lastDate).add(3, 'hour').toISOString(),
            fields: ['depo', 'cari', 'temsilci', 'odeme_plan']
        }

        const data = await Siparis.list({...params}, {page, limit})
        const count = await Siparis.listCount({...params})
        return Promise.resolve({data, count})
    }

    find(filter){
        return Siparis.find(filter)
    }

    last(serino){
        return Siparis.lastItem({serino})
    }

    create(data){
        return Siparis.createMany(data)
    }
}

module.exports = new SiparisService()
