const { PrismaClient } = require( '@prisma/client' )

class CariModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list(temsilci, {page, limit}){
        const where = !temsilci ? {} : {
            temsilci_kod: {
                in: temsilci
            }
        }

        console.log({temsilci, where})

        return this.db['cari'].findMany({
            skip: ((page - 1) * limit) + 1,
            take: limit,
            where,
            select: {
                kod: true,
                unvan: true,
                bakiye: true,
                temsilci: {
                    select: {
                        kod: true,
                        ad: true,
                        soyad: true
                    }
                }
            }
        })
    }
}

module.exports = new CariModel()
