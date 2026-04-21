const {PrismaClient} = require('@prisma/client')

class KampanyaModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list() {
        return this.db['kampanya'].findMany({
            select: {
                id: true,
                isim: true,
                aciklama: true,
                baslangic_tarihi: true,
                bitis_tarihi: true,
                limit: true,
                notlar: true,
                stoklar: {
                    select: {
                        miktar: true,
                        listefiyat: true,
                        fiyat: true,
                        stok: {
                            select: {
                                isim: true,
                                kod: true,
                                gorsel: true,
                                birim: true,
                                kdv: true
                            }
                        }
                    }
                }
            },
            orderBy: {baslangic_tarihi: 'desc'}
        })
    }

    find(id) {
        return this.db['kampanya'].findUnique({
            where: {id: parseInt(id)},
            select: {
                id: true,
                isim: true,
                aciklama: true,
                baslangic_tarihi: true,
                bitis_tarihi: true,
                olusturan_kod: true,
                limit: true,
                notlar: true,
                stoklar: {
                    select: {
                        miktar: true,
                        listefiyat: true,
                        fiyat: true,
                        stok: {
                            select: {
                                isim: true,
                                kod: true,
                                birim: true,
                                kdv: true,
                                gorsel: true
                            }
                        }
                    }
                }
            }
        })
    }

    create({stoklar, ...kampanya}) {
        return this.db['kampanya'].create({
            data: {
                ...kampanya,
                stoklar: {
                    createMany: {
                        data: stoklar
                    }
                }
            },
        })
    }

    remove(id) {
        return this.db['kampanya'].delete({
            where: {id: parseInt(id)}
        })
    }
}

module.exports = new KampanyaModel()
