const statusCodes = require('http-status-codes');
const { Tahsilat } = require('../services');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const {uuid} = require("uuidv4");
dayjs.extend(utc);

function incrementStringNumber(str) {
    let num = parseInt(str, 10) + 1
    return num.toString().padStart(8, '0')
}

const notImplemented = function (req, res) {
    res.status(statusCodes.OK).json({
        message: 'Not implemented yet'
    })
}

const list = (req, res, next) => {
    const temsilci = req.query?.temsilci?.split('-')
    const cari = req.query?.cari?.split('-')
    const firstDate = req.query?.firstDate
    const lastDate = req.query?.lastDate

    Tahsilat.list({cari, temsilci, firstDate, lastDate}, req.paginationOptions)
        .then( tahsilat => {
            res.status(statusCodes.OK).json({
                meta: {
                    pagination: {
                        ...req.paginationOptions,
                        total: tahsilat.count
                    }
                },
                data: tahsilat.data
            })
        }).catch( next )
}

const find = notImplemented

const create = async (req, res, next) => {
    const lastItem = await Tahsilat.lastItem() //{ referans_no: 'MK-000-000-2024-00001581', evrak_sira: 3365 }
    const referans_no = `MK-000-000-${dayjs().year()}-${incrementStringNumber(lastItem.referans_no.split('-').pop())}`
    const evrak_sira = lastItem.evrak_sira + 1
    const fis_sira = lastItem.cha_fis_sirano + 1
    const tarih = dayjs().utc().startOf('day').toISOString();
    const id = uuid().toUpperCase()

    console.log({id})

    const { aciklama, cari_kod, tutar, vade } = req.body

    const data = {
        evrak_sira,
        referans_no,
        tarih,
        cha_belge_tarih: tarih,
        aciklama,
        cari_kod,
        tutar,
        aratoplam: tutar,
        vade: parseInt(vade.replaceAll('-', '')),
        cha_fis_sirano: evrak_sira,
        fis_tarihi: tarih,
        temsilci_kod: '',
        id,
        doviz_kur: 1
    }

    Tahsilat.create(data)
        .then( tahsilat => {
            res.status(statusCodes.CREATED).json({
                data: tahsilat
            })
        }).catch( error => res.status(500).send(error.message) )
}

const remove = notImplemented

module.exports = {
    list,
    find,
    create,
    remove
}