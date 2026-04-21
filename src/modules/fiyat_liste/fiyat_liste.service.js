const FiyatListe = require('./fiyat_liste.model')

class FiyatListeService {
    list(){
        return FiyatListe.list()
    }

    find(id){
        return FiyatListe.find(id)
    }
}

module.exports = new FiyatListeService()