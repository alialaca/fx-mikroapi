const {PrismaClient} = require('@prisma/client')

class StokModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list({fields, page, limit, search}) {
        let query = {
            skip: ((page - 1) * limit),
            take: limit,
            where: {
                aktarim: true,
                OR: [
                    {kod: {contains: search}},
                    {kod: {equals: search}},
                    {isim: {contains: search}},
                    {isim: {equals: search}}
                ]
            },
            select: {
                kod: true,
                isim: true,
                birim: true,
                gorsel: true,
                marka: {
                    select: {
                        kod: true,
                        isim: true
                    }
                }
            },
            orderBy: {
                miktar: {merkez: 'desc'}
            }
        }

        if (fields) {
            if (fields.includes('miktar')) {
                query.select.miktar = {
                    select: {
                        merkez: true,
                        izmir_kiralik: true,
                        balikesir: true,
                        istanbul: true,
                        servis: true
                    }
                }
            }

            if (fields.includes('siparis')) {
                query.select.siparis = {
                    select: {
                        tarih: true,
                        miktar: true,
                        birim_fiyat: true,
                        tutar: true,
                        cari: {
                            select: {
                                unvan: true
                            }
                        }
                    },
                    where: {
                        durum: {gt: 0}
                    }
                }
            }

            if (fields.includes('kdv')) {
                query.select.kdv = true
            }

            if (fields.includes('fiyat')) {
                query.select.fiyat = {
                    select: {
                        fiyat: true,
                        liste_no: true
                    }
                }
            }
        }

        return this.db['stok'].findMany(query)
    }

    listCount(search) {
        return this.db['stok'].count({
            where: {
                aktarim: true,
                OR: [
                    {kod: {contains: search}},
                    {kod: {equals: search}},
                    {isim: {contains: search}},
                    {isim: search}
                ]
            }
        })
    }

    find(kod, {fields, temsilci}) {
        let query = {
            where: {
                aktarim: true,
                kod
            },
            select: {
                kod: true,
                isim: true,
                birim: true,
                gorsel: true,
                marka: {
                    select: {
                        kod: true,
                        isim: true
                    }
                },
                kategori: {
                    select: {
                        kod: true,
                        isim: true,
                    }
                },
                //TODO: tüm kategoriler için altkategori eklenip kategori kısmı olarak altkategori ve içerisinde ait olduğu ana kategori gösterilecek
                altKategori: {
                    select: {
                        kod: true,
                        isim: true
                    }
                }
            }
        }

        if (fields && fields.includes('miktar')) {
            query.select.miktar = {
                select: {
                    merkez: true,
                    izmir_kiralik: true,
                    balikesir: true,
                    istanbul: true,
                    servis: true
                }
            }
        }

        if (fields && fields.includes('fiyat')) {
            query.select.fiyat = {
                select: {
                    liste_no: true,
                    fiyat: true
                }
            }
        }

        if (fields && fields.includes('maliyet')) {
            query.select.maliyet = {
                select: {
                    maliyet: true,
                    baslangic_tarihi: true
                }
            }
        }

        if (fields && fields.includes('siparis')) {
            const siparisWhere = {
                onaylayan_kod: {gt: 0}
            }

            if (temsilci) siparisWhere.temsilci_kod = {
                in: temsilci
            }

            query.select.siparis = {
                take: 30,
                select: {
                    tarih: true,
                    miktar: true,
                    birim_fiyat: true,
                    iskonto: true,
                    vergi: true,
                    tutar: true,
                    cari: {
                        select: {
                            unvan: true,
                            sektor: true
                        }
                    }
                },
                where: siparisWhere,
                orderBy: {
                    tarih: 'desc'
                }
            }
        }

        return this.db['stok'].findFirst(query)
    }

    update(kod, data) {
        return this.db['stok'].update({
            where: {
                aktarim: true,
                kod
            },
            data
        })
    }
}

module.exports = new StokModel()
