const Prisma = require('../services/prisma')

class FiyatListModel {
    constructor() {
        this.db = Prisma()
    }

    list(){
        return this.db['fiyatListe'].findMany({
            select: {
                id: true,
                isim: true,
                _count: {
                    select: { fiyatlar: true }
                }
            },
        })
    }

    find(id) {
        return this.db['fiyatListe'].findUnique({
            select: {
                id: true,
                isim: true,
                fiyatlar: {
                    select: {
                        id: true,
                        fiyat: true,
                        birim: true,
                        stok: {
                            select: {
                                kod: true,
                                isim: true,
                                marka: true,
                                kategori: true,
                                altKategori: true
                            }
                        }
                    }
                }
            },
            where: { id }
        })
    }

}

module.exports = new FiyatListModel()