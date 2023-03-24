const { PrismaClient } = require( '@prisma/client' )

class SiparisModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list({cari, temsilci, firstDate, lastDate}, {page, limit}){
        const where = {
            tarih: {
                gte: firstDate,
                lte: lastDate
            }
        }

        if(cari) where.cari_kod = { in: cari}
        if(temsilci) where.temsilci_kod = { in: temsilci}

        return this.db['siparisOzet'].findMany({
            skip: ((page - 1) * limit) + 1,
            take: limit,
            where,
            orderBy: {tarih: "desc"},
            select: {
                tarih: true,
                evrak_seri: true,
                evrak_sira: true,
                satir_sayisi: true,
                miktar: true,
                miktar_teslim: true,
                miktar_kalan: true,
                tutar: true,
                tutar_net: true,
                onay: true,
                durum: true,
                odeme_plan: {
                    select: {id: true, isim: true}
                },
                depo: {
                  select: {id: true, isim: true}
                },
                cari: {
                  select: {kod: true, unvan: true}
                },
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

    find({serino, sirano}) {
        return this.db['siparisOzet'].findFirst({
            where: {
                evrak_seri: serino,
                evrak_sira: sirano
            },
            select: {
                tarih: true,
                evrak_seri: true,
                evrak_sira: true,
                satir_sayisi: true,
                miktar: true,
                miktar_teslim: true,
                miktar_kalan: true,
                tutar: true,
                tutar_net: true,
                onay: true,
                durum: true,
                odeme_plan: {
                    select: {id: true, isim: true}
                },
                depo: {
                    select: {id: true, isim: true}
                },
                cari: {
                    select: {kod: true, unvan: true}
                },
                temsilci: {
                    select: {
                        kod: true,
                        ad: true,
                        soyad: true
                    }
                },
                stoklar: {
                    select: {
                        id: true,
                        satirno: true,
                        miktar: true,
                        miktar_tamamlanan: true,
                        tutar: true,
                        iskonto: true,
                        vergi: true,
                        aciklama: true,
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

module.exports = new SiparisModel()
