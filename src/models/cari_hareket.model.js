const { PrismaClient } = require( '@prisma/client' )

class CariHareketModel {
    constructor() {
        this.db = new PrismaClient()
    }

    find(carikod) {
        return this.db['cariHareket'].findMany({
            where: {
                cari_kod : carikod,
                evrak_seri: {
                    not: 'X'
                }
            },
            orderBy: {
                tarih: 'desc'
            }
        })
    }
}

module.exports = new CariHareketModel()
