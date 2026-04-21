const prisma = require('../../services/prisma')

class DepoModel {
    constructor() {
        this.db = prisma
    }

    list(){
        return this.db['depo'].findMany()
    }
}

module.exports = new DepoModel()
