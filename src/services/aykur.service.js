const {Aykur} = require('../models')

class AykurService {
    constructor() {

    }

    list() {
        return Aykur.list()
    }

    create(data) {
        return Aykur.create(data)
    }

    update(data) {
        data.id = parseInt(data.id)
        return Aykur.update(data)
    }

    remove(id) {
        return Aykur.remove(parseInt(id))
    }
}

module.exports = new AykurService()
