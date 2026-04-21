const prisma = require('../../services/prisma');

class Model {
    constructor() {
        this.prisma = prisma;
    }

    async list(tableName) {
        console.log({tableName});
        return this.prisma.$queryRawUnsafe(`SELECT * FROM MikroDB_V16_FIXPRO.dbo.${tableName}`);
    }
}

module.exports = new Model();