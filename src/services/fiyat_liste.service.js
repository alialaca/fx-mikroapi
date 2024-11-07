const { FiyatListe } = require('../models')

class FiyatListeService {
    list(){
        return FiyatListe.list()
    }

    find(id){
        return FiyatListe.find(id)
    }
}

module.exports = new FiyatListeService()