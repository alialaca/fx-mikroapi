const CihazHareket = require('./cihaz_hareket.model')
class CihazHareketService {
    async find(kod) {
        return CihazHareket.find(kod)
    }
}

module.exports = new CihazHareketService()
