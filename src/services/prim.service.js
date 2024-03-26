const { PrismaClient } = require('@prisma/client')
class PrimService {
    constructor() {
        this.db = new PrismaClient()
    }
    async ozet(temsilci) {
        const where = {}
        if (temsilci) where.temsilci_kod = temsilci
        return this.db['primOzet'].findMany({
            where,
            select: {
                temsilci: {
                    select: {
                        kod: true,
                        ad: true,
                        soyad: true
                    }
                },
                alacak_tl: true,
                satis_tl: true,
                satis_euro: true,
                hedef_euro: true,
                kar_euro: true,
                oran: true
            }
        })
    }
}

module.exports = new PrimService()
