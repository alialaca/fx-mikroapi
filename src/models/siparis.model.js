const { PrismaClient } = require( '@prisma/client' )
const Prisma = require('../services/prisma')

class SiparisModel {
    constructor() {
        this.db = Prisma()
    }

    list({search, cari, temsilci, durum, firstDate, lastDate, stok, fields = []}, {page, limit}){

        const select = {
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
            durum: true
        }

        if (fields.includes('depo')) select.depo = { select: { id: true, isim: true } }
        if (fields.includes('cari')) select.cari = { select: { kod: true, unvan: true } }
        if (fields.includes('temsilci')) select.temsilci = { select: { kod: true, ad: true, soyad: true } }
        if (fields.includes('odeme_plan')) select.odeme_plan = { select: { id: true, isim: true } }

        const where = {
            tarih: {
                gte: firstDate,
                lte: lastDate
            }
        }

        //TODO: sipariş için search seçeneği eklenecek
        // if (search) {
        //     where.OR = [
        //         {cari_kod: {contains: search}},
        //         {cari_kod: {contains: search}},
        //     ]
        // }

        if(cari) where.cari_kod = { in: cari}
        if(temsilci) where.temsilci_kod = { in: temsilci}
        if(stok) where.stok_kod = stok
        if(durum) where.durum = durum

        const query = {
            skip: (page - 1) * limit,
            take: limit,
            where,
            select,
            orderBy: {olusturma_tarihi: "desc"}
        }

        return this.db['siparisOzet'].findMany(query)
    }

    listCount({cari, temsilci, durum, firstDate, lastDate, stok}) {
        const where = {
            tarih: {
                gte: firstDate,
                lte: lastDate
            }
        }

        if(cari) where.cari_kod = { in: cari}
        if(temsilci) where.temsilci_kod = { in: temsilci}
        if(stok) where.stok_kod = stok
        if(durum) where.durum = durum

        const query = {
            where,
        }

        return this.db['siparisOzet'].count(query)
    }

    find({serino, sirano, temsilci}) {
        const where = {
            evrak_seri: serino,
            evrak_sira: sirano
        }

        if (temsilci) where.temsilci_kod = temsilci


        return this.db['siparisOzet'].findFirst({
            where,
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
                proje: true,
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
                        soyad: true,
                        tel: true,
                        eposta: true
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
                                isim: true,
                                marka: true,
                                gorsel: true,
                                bedenHareket: {
                                    where: {
                                        evrak_seri: serino,
                                        evrak_sira: sirano
                                    },
                                    select: {
                                        beden: true,
                                        renk: true,
                                        miktar: true
                                    }
                                }
                            }
                        }
                    }
                },
                aciklama: {
                    select: {
                        satir1: true,
                        satir2: true,
                        satir3: true,
                        satir4: true,
                        satir5: true,
                        satir6: true,
                        satir7: true,
                        satir8: true,
                        satir9: true,
                        satir10: true,
                    }
                }
            }
        })
    }

    lastItem({serino}) {
        return this.db['siparisOzet'].findFirst({
            where: {
                evrak_seri: serino
            },
            orderBy: {
                evrak_sira: 'desc'
            }
        })
    }

    async createMany(data){
        const result = await this.db.siparis.createMany({
            data
        })
        return result.count
    }
}

module.exports = new SiparisModel()
