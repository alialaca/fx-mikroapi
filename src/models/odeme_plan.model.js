const Prisma = require('../services/prisma')

class OdemePlanModel {
    constructor() {
        this.db = Prisma()
    }

    list(){
        return this.db['odemePlan'].findMany({
            orderBy: {id: 'asc'}
        })
    }
}

module.exports = new OdemePlanModel()
