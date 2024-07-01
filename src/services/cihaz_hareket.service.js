const { CihazHareket } = require('../models')
class CihazHareketService {
    async find(kod) {
        return CihazHareket.find(kod)
    }
}

module.exports = new CihazHareketService()
