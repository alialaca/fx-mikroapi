const { PrismaClient } = require('@prisma/client');

class Model {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async list(tableName) {
        console.log({tableName});
        return this.prisma.$queryRawUnsafe(`SELECT * FROM MikroDB_V16_FIXPRO.dbo.${tableName}`);
    }
}

module.exports = new Model();