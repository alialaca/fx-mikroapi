const Prisma = require('../services/prisma')

class SiparisOrtakModel {
    constructor() {
        this.db = Prisma()
    }
    async create(data){
        const result = await this.db.siparisOrtak.createMany({
            data
        })
        console.log(result)
        return result.count
    }
}

module.exports = new SiparisOrtakModel()