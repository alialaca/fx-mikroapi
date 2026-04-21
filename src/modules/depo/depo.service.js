const Depo = require('./depo.model')
class DepoService {
    constructor() {

    }

    list(){
        return Depo.list()
    }
}

module.exports = new DepoService()
