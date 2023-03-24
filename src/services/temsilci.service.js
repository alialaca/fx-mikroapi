const { Temsilci } = require('../models')
class TemsilciService {
    constructor() {

    }

    list(){
        return Temsilci.list()
    }
}

module.exports = new TemsilciService()
