const prisma = require('../../services/prisma')

class TemsilciModel {
    constructor() {
        this.db = prisma
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
