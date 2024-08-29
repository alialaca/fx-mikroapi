const statusCodes = require('http-status-codes')
const {uuid} = require('uuidv4')
const { Siparis, Aciklama} = require('../services')

const dayjs = require('dayjs')
// const timezone = require('dayjs/plugin/timezone')
// const utc = require('dayjs/plugin/utc')
//
// dayjs.extend(timezone())
// dayjs.extend(utc)
// dayjs.tz.setDefault("Europe/Istanbul")

const list = async (req, res, next) => {
    const temsilci = req.query?.temsilci?.split('-')
    const cari = req.query?.cari?.split('-')
    const durum = req.query?.durum
    const firstDate = req.query?.firstDate
    const lastDate = req.query?.lastDate

    Siparis.list({cari, temsilci, durum, firstDate, lastDate}, req.paginationOptions)
        .then( siparis => {
            res.status(statusCodes.OK).json({
                meta: {
                    pagination: {
                        ...req.paginationOptions,
                        total: siparis.count
                    }
                },
                data: siparis.data
            })
        }).catch( next )
}

const find = async (req, res) =>
{
    const result = await Siparis.find({
        serino: req.params?.seri,
        sirano: req.params?.sira,
        temsilci: req.query?.temsilci
    },
        req.paginationOptions
    )

    res.status(200).json({
        data: result
    })
}

const create = async (req, res) => {
    const serino = req.body?.evrak_seri || ""
    const lastRecord = await Siparis.last(serino)

    req.body.evrak_sira = !lastRecord ? 1 : lastRecord.evrak_sira + 1

    const data = req.body?.stoklar.map( (item, index) => {
        const today = dayjs(dayjs().format('YYYY-MM-DDT00:00:00Z')).toISOString()
        const vergiOran = item.vergi === (item.miktar * item.birim_fiyat * 0.1) ? 0.1 : 0.2

        // İskonto oran küsürat kontrolü
        // const iskontoOran = parseFloat((item.iskonto / (item.birim_fiyat * item.miktar)).toFixed(0))

        // // Servis siparişleri için iskonto sıfır olarak işlem yapma
        if (req.body.proje === '1') {
            const netFiyat = (item.birim_fiyat * item.miktar) - item.iskonto
            if (netFiyat === 0){
                item.iskonto = item.birim_fiyat * item.miktar
            } else {
                item.birim_fiyat = netFiyat / item.miktar
                item.iskonto = 0
            }
        }

        return {
            id: uuid().toUpperCase(),
            tarih: today,
            evrak_seri: req.body.evrak_seri,
            evrak_sira: req.body.evrak_sira,
            satirno: index,
            olusturan_kod: req.body.olusturan,
            temsilci_kod: req.body.temsilci,
            cari_kod: req.body.cari,
            stok_kod: item.stok,
            birim_fiyat: item.birim_fiyat,
            miktar: item.miktar,
            tutar: item.miktar * item.birim_fiyat,
            iskonto: item.iskonto,
            vergi: item.vergi || ((item.birim_fiyat * item.miktar) - item.iskonto ) * vergiOran,
            odeme_plan_kod: req.body.odemeplan,
            aciklama: item.aciklama,
            depo_kod: req.body.depo,
            sip_lastup_user: req.body.olusturan,
            sip_tarih: today,
            sip_teslim_tarih: today,
            doviz_cinsi: req.body.doviz_cinsi,
            doviz_kuru: 1,
            alternatif_doviz_kuru: 1,
            proje_kod: req.body.proje,
            sip_vergi_pntr: vergiOran === 0.1 ? 7 : 8
        }
    })
    await Siparis.create(data)

    if (req.body.notlar) {
        const noteData = {
            id: uuid().toUpperCase(),
            olusturan_kod: req.body.olusturan,
            lastup_user: req.body.olusturan,
            evrak_seri: req.body.evrak_seri,
            evrak_sira: req.body.evrak_sira,
        }
        req.body.notlar.forEach((not, index) => noteData[`satir${index + 1}`] = not)

        await Aciklama.create(noteData)
    }

    const result = await Siparis.find({
            serino: serino,
            sirano: req.body.evrak_sira
        },
        req.paginationOptions
    )

    res.status(200).json({
        data: result
    })
}

module.exports = {
    list,
    find,
    create
}
