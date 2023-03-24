const { CariHareket } = require('../models')
class CariHareketService {
    find(stokkod){
        return CariHareket.find(stokkod)
    }
}

module.exports = new CariHareketService()
