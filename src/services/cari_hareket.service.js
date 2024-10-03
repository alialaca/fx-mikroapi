const { CariHareket } = require('../models')
class CariHareketService {
    find(carikod){
        return CariHareket.find(carikod)
    }

    faturaDetay(id) {
        return CariHareket.detail(id)
    }
}

module.exports = new CariHareketService()
