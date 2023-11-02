const { PrismaClient } = require( '@prisma/client' )

class TemsilciModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list(){
        return this.db['temsilci'].findMany({
            where: {
                tip: 0
            },
            orderBy: {
                ad: 'asc'
            }
        })
    }
}

module.exports = new TemsilciModel()
