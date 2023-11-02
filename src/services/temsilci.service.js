const { Temsilci } = require('../models')
class TemsilciService {
    list(){
        return Temsilci.list()
    }
}

module.exports = new TemsilciService()
