const Prisma = require('../services/prisma')

class TahsilatModel {
    constructor() {
        this.db = Prisma()
    }

    list({cari, temsilci, firstDate, lastDate}, {page, limit}) {
        const select = {
            id: true,
            evrak_sira: true,
            tarih: true,
            aciklama: true,
            temsilci_kod: true,
            doviz_kur: true,
            tutar: true,
            aratoplam: true,
            vade: true,
            fis_tarihi: true,
            referans_no: true,
            cari: {
                select: {
                    unvan: true,
                    kod: true
                }
            }
        }

        const where = {
            cha_evrak_tip: 1,
            tarih: {
                gte: firstDate,
                lte: lastDate
            }
        }

        if (cari) where.cari_kod = {in: cari}
        if (temsilci) where.temsilci_kod = {in: temsilci}

        const query = {
            skip: (page - 1) * limit,
            take: limit,
            where,
            select,
            orderBy: {tarih: 'desc'}
        }


        return this.db['tahsilat'].findMany(query)
    }

    listCount({cari, temsilci, firstDate, lastDate}) {
        const where = {
            cha_evrak_tip: 1,
            tarih: {
                gte: firstDate,
                lte: lastDate
            }
        }

        if (cari) where.cari_kod = {in: cari}
        if (temsilci) where.temsilci_kod = {in: temsilci}

        return this.db['tahsilat'].count({where})
    }

    lastItem() {
        return this.db['tahsilat'].findFirst({
            where: {
                cha_evrak_tip: 1,
                cha_evrakno_seri: ''
            },
            orderBy: [
                {
                    referans_no: 'desc',
                },
                {
                    evrak_sira: 'desc',
                },
            ],
            select: {
                referans_no: true,
                evrak_sira: true,
            },
        });
    }
}

module.exports = new TahsilatModel()