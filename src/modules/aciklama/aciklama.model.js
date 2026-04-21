const prisma = require('../../services/prisma')

class AciklamaModel {
    constructor() {
        this.db = prisma
    }
    async create(data){
        const result = await this.db.aciklama.create({
            data
        })
        return result.count
    }
}

module.exports = new AciklamaModel()
