const { SiparisOrtak} = require('../models')
class SiparisOrtakService {
    create(data){
        return SiparisOrtak.create(data)
    }
}

module.exports = new SiparisOrtakService()