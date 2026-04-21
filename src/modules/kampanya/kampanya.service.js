const Kampanya = require('./kampanya.model')

class KampanyaService {

    list() {
        return Kampanya.list()
    }

    find(id) {
        return Kampanya.find(id)
    }

    create(data) {
        return Kampanya.create(data)
    }

    remove(id) {
        return Kampanya.remove(id)
    }
}

module.exports = new KampanyaService()
