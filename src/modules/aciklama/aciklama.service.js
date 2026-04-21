const Aciklama = require('./aciklama.model')

class AciklamaService {
    create(data){
        return Aciklama.create(data)
    }
}

module.exports = new AciklamaService()
