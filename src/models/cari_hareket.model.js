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

    detail(id) {
        return this.db['cariHareket'].findFirst({
            where: {
                id,
                evrak_seri: {
                    not: 'X'
                }
            },
            select: {
                id: true,
                tarih: true,
                evrak_seri: true,
                evrak_sira: true,
                evrak_tip: true,
                evrak_cins: true,
                normal_iade: true,
                vade_tarihi: true,
                borc_alacak: true,
                ana_doviz_borc: true,
                ana_doviz_alacak: true,
                cari: {
                    select: {
                        kod: true,
                        unvan: true
                    }
                },
                stokHareket: {
                    select: {
                        miktar: true,
                        tutar: true,
                        vergi: true,
                        iskonto1: true,
                        iskonto2: true,
                        stok: {
                            select: {
                                kod: true,
                                isim: true
                            }
                        }
                    }
                }
            }
        })
    }
}

module.exports = new CariHareketModel()
