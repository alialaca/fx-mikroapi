const dayjs = require('dayjs')
const { Satis, Cari} = require('../models')
class SatisService {
    async ozet({yil, type, temsilci}) {
        const data = await Satis.ozet({yil, type, temsilci})
        return Promise.resolve({data})
    }
    async list({firstDate, lastDate, kar}) {
        const data = await Satis.list({firstDate, lastDate, kar})
        return Promise.resolve({data})
    }
}

module.exports = new SatisService()
