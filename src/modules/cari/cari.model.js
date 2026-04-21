const prisma = require('../../services/prisma')

class CariModel {
    constructor() {
        this.db = prisma
    }

    list(temsilci, {page, limit, search}){
        const where = {
            kod: {startsWith: '120.'},
            aktarim: true,
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
                kilitli: true,
                temsilci: {
                    select: {
                        kod: true,
                        ad: true,
                        soyad: true,
                        eposta: true
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
                    aktarim: true
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

    find({kod, vkn}) {
        let where
        if (kod) where = { kod, aktarim: true }
        if (vkn) where = { vkn }
        return this.db['cari'].findFirst({
            where,
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
                mutabakat_eposta: true,
                kilitli: true
            }
        })
    }

    /**
    * Yeni Cari Hesap Oluştur
    * @param {object} data
    * @param {string} data.unvan - Cari Hesap Unvanı
    * @param {string} data.vkn - Cari Hesap VKN
    * @param {string} data.tel - Cari Hesap Telefonu
    * @param {string} data.eposta - Cari Hesap E-Postası
    * @param {string} data.temsilci_kod - Cari Hesap Temsilci Kodu
     */
    async create({vkn, unvan, tel, eposta, temsilci_kod}) {
        const lastRecord = await this.db['cariHesap'].findFirst({
            where: {
                kod: {startsWith: '120.1'},
            },
            orderBy: {
                kod: 'desc'
            },
            select: {
                kod: true
            }
        })

        if (!lastRecord) {
            return new Error('Son kayıt bulunamadı')
        }

        let lastRecordKod = lastRecord.kod //'120.19.999'
        lastRecordKod = lastRecordKod.replaceAll('.','') //'12019999'
        lastRecordKod = parseInt(lastRecordKod) // 12019999
        let nextKod = lastRecordKod + 1 // 12020000
        nextKod = nextKod.toString() // '12020000'
        nextKod = nextKod.replace(/(\d{3})(\d{2})(\d{3})/, '$1.$2.$3') // '120.20.0000'

        return this.db['cariHesap'].create({
            data: {
                vkn,
                kod: nextKod,
                unvan1: unvan,
                eposta,
                tel,
                temsilci_kod,
                grup_kod: 'SRV',
                aktarim: false
            },
            select: {
                kod: true,
                unvan1: true,
                vkn: true,
                eposta: true,
                tel: true,
                temsilci_kod: true,
                grup_kod: true
            }
        })
    }
}

module.exports = new CariModel()
