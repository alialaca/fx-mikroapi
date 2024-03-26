const {PrismaClient: Prisma} = require('@prisma/client')

// const Prisma = require('../services/prisma')

class SatisModel {
    constructor() {
        this.db = new Prisma({
            log: ['error']
        })
    }

    ozet({yil, type, temsilci = []}) {
        const groups = ['yil', 'ay_index', 'ay']
        const where = {yil}
        if (temsilci?.length > 0) where.temsilci_kod = {in: temsilci}

        const types = ['marka', 'bolge', 'anagrup', 'odeme', 'temsilci_isim']
        if (types.includes(type)) groups.push(type)

        return this.db['satis'].groupBy({
            by: groups,
            where,
            _sum: {
                tutar: true
            },
            orderBy: {ay_index: 'asc'}
        })
    }

    list({firstDate, lastDate, kar}) {
        const select = {
            tarih: true,
            yil: true,
            ceyrek: true,
            ay: true,
            stok: {
                select: {
                    kod: true,
                    isim: true
                }
            },
            odeme: true,
            temsilci_isim: true,
            cari: {
                select: {
                    kod: true,
                    unvan: true
                }
            },
            bolge: true,
            marka: true,
            anagrup: true,
            miktar: true,
            tutar: true,
            kur: true,
            iade: true
        }

        if(kar) {
            select.alis_kur = true
            select.alis_tl = true
            select.alis_euro = true
            select.satis_tl = true
            select.satis_euro = true
            select.kar_tl = true
            select.kar_euro = true
            select.kar_oran = true
        }

        return this.db['satis'].findMany({
            where: {
                tarih: {
                    gte: firstDate,
                    lte: lastDate
                },
                NOT: {
                    tutar: null
                }
            },
            select
        })
    }
}

module.exports = new SatisModel()
