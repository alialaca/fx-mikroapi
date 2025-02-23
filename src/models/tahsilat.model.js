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
        const evrak_sira_record = await this.db['tahsilat'].findFirst({
            where: {
                cha_evrak_tip: 1,
                cha_evrakno_seri: '',
                cha_belge_tarih: {gte: dayjs().utc().startOf('year').toISOString()}
            },
            orderBy: [
                {
                    evrak_sira: 'desc',
                }
            ],
            select: {
                evrak_sira: true,
            }
        })

        const referans_no_record = await this.db['tahsilat'].findFirst({
            where: {
                cha_evrak_tip: 1,
                cha_evrakno_seri: '',
                cha_belge_tarih: {gte: dayjs().utc().startOf('year').toISOString()}
            },
            orderBy: [
                {
                    referans_no: 'desc',
                },
            ],
            select: {
                referans_no: true
            }
        })
        return Promise.resolve({
            referans_no: referans_no_record.referans_no,
            evrak_sira: evrak_sira_record.evrak_sira
        })
    }

    async create(data) {
        const cari = await this.db['cari'].findUnique({
            where: {kod: data.cari_kod},
            select: {
                kod: true,
                unvan: true,
                temsilci_kod: true,
                vkn: true,
                vergi_daire_adi: true,
            }
        })

        if (!cari.kod) return new Error('Cari kod hatalı, karşılık bulunamadı')
        data.temsilci_kod = cari.temsilci_kod

        const maliyil = dayjs(data.tarih).year()
        const today = dayjs().utc().startOf('day').toISOString();

        const yevmiye_no_record = await this.db['muhasebeFis'].findFirst({
            where: {
                fis_maliyil: maliyil
            },
            orderBy: [
                {fis_yevmiye_no: 'desc'}
            ],
            select: {
                fis_yevmiye_no: true,
            }
        })

        const sira_no_record = await this.db['muhasebeFis'].findFirst({
            where: {
                fis_maliyil: maliyil,
                fis_tarih: {lte: today}
            },
            orderBy: [
                {fis_tarih: 'desc'},
                {fis_yevmiye_no: 'desc'},
                {fis_sira_no: 'desc'},
            ],
            select: {
                fis_sira_no: true,
                fis_yevmiye_no: true,
                fis_tarih: true
            }
        })

        if (!yevmiye_no_record || !sira_no_record) throw new Error('Muhasebe fiş verilerine erişilemedi')

        const fis_yevmiye_no = yevmiye_no_record.fis_yevmiye_no + 1
        const fis_sira_no = dayjs().isSame(dayjs(sira_no_record.fis_tarih), 'day') ? sira_no_record?.fis_sira_no + 1 : 1

        const {alis: kur} = await this.db['dovizKur'].findFirst({where: {no: 1}, orderBy: {tarih: 'desc'}})

        const tahsilat_data = {
            ...data,
            cha_fis_sirano: fis_sira_no,
            doviz_kur: kur,
            vade: parseInt(dayjs(data.vade).format('YYYYMMDD')),
        }

        const dovizMeblag = parseFloat((data.tutar / kur).toFixed(2));

        const muhasebe_fis_data = [
            {
                id: uuid().toUpperCase(),
                fis_maliyil: maliyil,
                fis_tarih: today,
                fis_sira_no,
                fis_hesap_kod: cari.kod,
                fis_satir_no: 0,
                fis_aciklama1: `Tah.mak. : ${data.evrak_sira}/${dayjs(data.tarih).format('DD.MM.YYYY')}/${data.aciklama}/${data.cari_kod}/${cari.unvan}`.slice(0, 127),
                fis_meblag0: data.tutar * -1,
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
                fis_tarih: today,
                fis_sira_no,
                fis_hesap_kod: '108.10.001',
                fis_satir_no: 1,
                fis_aciklama1: `Tah.mak. : ${data.evrak_sira}/${dayjs(data.tarih).format('DD.MM.YYYY')}/${data.aciklama}/102.10.008/T.C. ZİRAAT BANKASI A.Ş./${data.cari_kod}/${cari.unvan}`.slice(0, 127),
                fis_meblag0: data.tutar,
                fis_meblag1: dovizMeblag,
                fis_meblag2: data.tutar,
                fis_ticari_uid: data.id.toUpperCase(),
                fis_tic_evrak_sira: data.evrak_sira,
                fis_tic_belgetarihi: data.tarih,
                fis_yevmiye_no
            }
        ]

        const muhasebe_fis_detay_data = {
            evrak_seri: '',
            evrak_sira: data.evrak_sira,
            cariunvan: cari.unvan.slice(0, 127),
            carivergidaireadi: cari.vergi_daire_adi,
            carivergidaireno: cari.vkn,
            belgetarihi: data.tarih,
            carikodu: cari.kod,
            carimuhkodu: cari.kod,
            aciklama: data.aciklama
        }

        const odeme_emir_data = {
            id: uuid().toUpperCase(),
            refno: data.referans_no,
            borclu: cari.unvan.slice(50),
            vdaire_no: `${cari.vergi_daire_adi.slice(0, 28)} ${cari.vkn}`.slice(0, 40),
            tutar: data.tutar,
            vade: data.vade,
            cari_kodu: cari.kod,
            ilk_hareket_tarihi: data.tarih,
            son_hareket_tarihi: data.tarih,
            evrak_seri: "",
            evrak_sira_no: data.evrak_sira
        }

        const [tahsilatRecord, fisRrecord] = await this.db.$transaction([
            this.db['tahsilat'].create({data: tahsilat_data}),
            this.db['muhasebeFis'].createMany({data: muhasebe_fis_data}),
            this.db['muhasebeFisDetay'].create({data: muhasebe_fis_detay_data}),
            this.db['odemeEmir'].create({data: odeme_emir_data})
        ])

        return Promise.resolve(tahsilatRecord)
    }

    async remove(id) {
        const tahsilat = await this.db['tahsilat'].findUnique({where: {id}})
        return this.db.$transaction([
            this.db['tahsilat'].deleteMany({where: {id}}),
            this.db['muhasebeFis'].deleteMany({where: {fis_ticari_uid: id}}),
            this.db['muhasebeFisDetay'].deleteMany({
                where: {
                    evrak_sira: tahsilat.evrak_sira,
                    aciklama: tahsilat.aciklama
                }
            }),
            this.db['odemeEmir'].deleteMany({where: {refno: tahsilat.referans_no, evrak_sira_no: tahsilat.evrak_sira}})
        ])
    }
}

module.exports = new TahsilatModel()