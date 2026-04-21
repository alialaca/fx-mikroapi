const prisma = require('../../services/prisma')

class SiparisOrtakModel {
    constructor() {
        this.db = prisma
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