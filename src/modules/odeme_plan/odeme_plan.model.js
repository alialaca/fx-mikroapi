const prisma = require('../../services/prisma')

class OdemePlanModel {
    constructor() {
        this.db = prisma
    }

    list(){
        return this.db['odemePlan'].findMany({
            where: {
              NOT: {
                  iskonto_kod: 0
              }
            },
            include: {
                iskonto: true
            },
            orderBy: {id: 'asc'}
        })
    }
}

module.exports = new OdemePlanModel()
