const { CariHareket } = require('../models')
class CariHareketService {
    find(carikod){
        return CariHareket.find(carikod)
    }
}

module.exports = new CariHareketService()
