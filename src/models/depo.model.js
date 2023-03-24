const { PrismaClient } = require( '@prisma/client' )

class DepoModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list(){
        return this.db['depo'].findMany()
    }
}

module.exports = new DepoModel()
