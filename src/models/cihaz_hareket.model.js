const {PrismaClient} = require('@prisma/client')

class CihazHareketModel {
    constructor() {
        this.db = new PrismaClient()
    }

    find(search) {
        return this.db['cihazHareket'].findMany({
            where: {
                serino: search
            }
        })
    }
}

module.exports = new CihazHareketModel()
