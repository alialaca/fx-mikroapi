const { PrismaClient } = require( '@prisma/client' )

class TemsilciModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list(){
        return this.db['temsilci'].findMany()
    }
}

module.exports = new TemsilciModel()
