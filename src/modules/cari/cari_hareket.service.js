const CariHareket = require('./cari_hareket.model')
class CariHareketService {
    find(carikod){
        return CariHareket.find(carikod)
    }

    faturaDetay(id) {
        return CariHareket.detail(id)
    }
}

module.exports = new CariHareketService()
