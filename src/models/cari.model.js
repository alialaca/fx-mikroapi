const { PrismaClient } = require( '@prisma/client' )

class CariModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list(temsilci, {page, limit, search}){
        const where = {
            kod: {startsWith: '120.'},
            OR: [
                { kod: {contains: search} },
                { kod: {equals: search} },
                { unvan: {contains: search} },
                { unvan: {equals: search} }
            ]
        }

        if (temsilci) where.temsilci_kod = {
            in: temsilci
        }

        return this.db['cari'].findMany({
            skip: (page - 1) * limit,
            take: limit,
            where,
            select: {
                kod: true,
                unvan: true,
                bakiye: true,
                sektor: true,
                temsilci: {
                    select: {
                        kod: true,
                        ad: true,
                        soyad: true
                    }
                }
            },
            orderBy: {
                bakiye: 'desc'
            }
        })
    }

    listCount(temsilci, search){
        const where = {
            AND: [
                {
                    kod: {startsWith: '120.'},
                },
                {
                    OR: [
                        { kod: {contains: search} },
                        { kod: {equals: search} },
                        { unvan: {contains: search} },
                        { unvan: {equals: search} }
                    ]
                }
            ]
        }

        if (temsilci) where.temsilci_kod = {
            in: temsilci
        }

        return this.db['cari'].count({
            where
        })
    }

    find(kod) {
        return this.db['cari'].findFirst({
            where: {kod},
            select: {
                kod: true,
                unvan: true,
                vkn: true,
                vergi_daire_adi: true,
                tarih: true,
                bakiye: true,
                sektor: true,
                temsilci: {
                    select: {
                        kod: true,
                        ad: true,
                        soyad: true,
                        tel: true,
                        eposta: true
                    }
                },
                eski_temsilci: {
                    select: {
                        kod: true,
                        ad: true,
                        soyad: true
                    }
                },
                adres: {
                    select: {
                        il: true,
                        ilce: true,
                        mahalle: true,
                        cadde: true,
                        sokak: true,
                        semt: true,
                        aptno: true,
                        postakod: true
                    }
                },
                bolge: true,
                eposta: true,
                tel: true,
                mutabakat_eposta: true
            }
        })
    }
}

module.exports = new CariModel()
