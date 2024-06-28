const Prisma = require('../services/prisma')
const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc')
const {ignore} = require("nodemon/lib/rules");
const {uuid} = require("uuidv4");
dayjs.extend(utc)

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

    async lastItem() {
        return this.db['tahsilat'].findFirst({
            where: {
                cha_evrak_tip: 1,
                cha_evrakno_seri: ''
            },
            orderBy: [
                {
                    evrak_sira: 'desc',
                },
                {
                    referans_no: 'desc',
                },
            ],
            select: {
                referans_no: true,
                evrak_sira: true,
            },
        });
    }

    async create(data) {
        const cari = await this.db['cari'].findUnique({where: {kod: data.cari_kod}})

        if (!cari.kod) return new Error('Cari kod hatalı, karşılık bulunamadı')
        data.temsilci_kod = cari.temsilci_kod

        const maliyil = dayjs(data.tarih).year()
        const sonFisKaydi = await this.db['muhasebeFis'].findFirst({
            where: {
                fis_maliyil: maliyil
            },
            orderBy: [
                {fis_maliyil: 'desc'},
                {fis_yevmiye_no: 'desc'},
                {fis_sira_no: 'desc'},
            ],
            select: {
                fis_sira_no: true,
                fis_yevmiye_no: true
            }
        })

        if (!sonFisKaydi) throw new Error('Muhasebe fiş verilerine erişilemedi')

        const { alis: kur} = await this.db['dovizKur'].findFirst({where: {no: 1}, orderBy: {tarih: 'desc'}})

        const fis_yevmiye_no = sonFisKaydi?.fis_yevmiye_no + 1
        const fis_sira_no = sonFisKaydi?.fis_sira_no + 1

        data.cha_fis_sirano = fis_sira_no
        data.doviz_kur = kur

        const meblag = data.tutar
        const dovizMeblag = parseFloat((data.tutar / kur).toFixed(2));

        const muhasebe_fis_data = [
            {
                id: uuid().toUpperCase(),
                fis_maliyil: maliyil,
                fis_tarih: data.tarih,
                fis_sira_no,
                fis_hesap_kod: cari.kod,
                fis_satir_no: 0,
                fis_aciklama1: `Tah.mak. : ${data.evrak_sira}/${data.tarih}/${data.aciklama}/${data.cari_kod}/${cari.unvan}`.slice(0, 127),
                fis_meblag0: meblag * -1,
                fis_meblag1: dovizMeblag * -1,
                fis_meblag2: data.tutar * -1,
                fis_ticari_uid: data.id.toUpperCase(),
                fis_tic_evrak_sira: data.evrak_sira,
                fis_tic_belgetarihi: data.tarih,
                fis_yevmiye_no
            },
            {
                id: uuid().toUpperCase(),
                fis_maliyil: maliyil,
                fis_tarih: data.tarih,
                fis_sira_no,
                fis_hesap_kod: '108.10.001',
                fis_satir_no: 1,
                fis_aciklama1: `Tah.mak. : ${data.evrak_sira}/${data.tarih}/${data.aciklama}/102.10.001/T.C. ZİRAAT BANKASI A.Ş./${data.cari_kod}/${cari.unvan}`.slice(0, 127),
                fis_meblag0: meblag,
                fis_meblag1: dovizMeblag,
                fis_meblag2: data.tutar,
                fis_ticari_uid: data.id.toUpperCase(),
                fis_tic_evrak_sira: data.evrak_sira,
                fis_tic_belgetarihi: data.tarih,
                fis_yevmiye_no
            }
        ]

        const [tahsilatRecord, fisRrecord] = await this.db.$transaction([
            this.db['tahsilat'].create({data}),
            this.db['muhasebeFis'].createMany({data: muhasebe_fis_data})
        ])

        return Promise.resolve(tahsilatRecord)
    }

    remove(id) {
        return this.db.$transaction(async (db) => {
            const tahsilat = await db['tahsilat'].deleteMany({where: {id}})
            await db['muhasebeFis'].deleteMany({
                where: {
                    fis_ticari_uid: id
                }
            })
            return Promise.resolve(tahsilat)
        })
    }
}

module.exports = new TahsilatModel()