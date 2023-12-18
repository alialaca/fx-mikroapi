const { Aciklama} = require('../models')
class AciklamaService {
    create(data){
        return Aciklama.create(data)
    }
}

module.exports = new AciklamaService()
