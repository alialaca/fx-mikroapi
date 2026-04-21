const SiparisOrtak = require('./siparis_ortak.model')

class SiparisOrtakService {
    create(data){
        return SiparisOrtak.create(data)
    }
}

module.exports = new SiparisOrtakService()