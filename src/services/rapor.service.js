const {Rapor} = require('../models')

class RaporService {

    list(tableName) {
        return Rapor.list(tableName)
    }
}

module.exports = new RaporService()
