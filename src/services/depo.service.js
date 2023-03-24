const { Depo } = require('../models')
class DepoService {
    constructor() {

    }

    list(){
        return Depo.list()
    }
}

module.exports = new DepoService()
