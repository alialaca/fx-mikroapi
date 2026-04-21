const Rapor = require('./rapor.model')

class RaporService {

    list(tableName) {
        return Rapor.list(tableName)
    }
}

module.exports = new RaporService()
