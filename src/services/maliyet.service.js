const {Maliyet} = require('../models')

class MaliyetService {

    list() {
        return Maliyet.list()
    }

    create(data) {
        return Maliyet.create(data)
    }

    update(data) {
        data.id = parseInt(data.id)
        return Maliyet.update(data)
    }

    remove(id) {
        return Maliyet.remove(parseInt(id))
    }
}

module.exports = new MaliyetService()
