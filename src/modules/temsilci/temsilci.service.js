const Temsilci = require('./temsilci.model')
class TemsilciService {
    list(){
        return Temsilci.list()
    }
}

module.exports = new TemsilciService()
