const prisma = require('../../services/prisma')

class CihazHareketModel {
    constructor() {
        this.db = prisma
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
