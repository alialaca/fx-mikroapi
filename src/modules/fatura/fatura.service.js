const dayjs = require('dayjs')
const mikroErp = require('../../services/mikroErp')
const ApiError = require('../../utils/ApiError')

const CARI_KOD_PREFIX = '120.1'
const CARI_KOD_MIN = '120.10.001'
const CARI_KOD_MAX = '120.19.999'
const EMPTY_DATE_SENTINEL = '1899-12-30'
const KULLANICI_KODU = 'SRV'
const STH_EVRAKNO_SERI = 'AS44'

const extractRows = (res) => {
    if (!res) return []
    if (Array.isArray(res)) return res
    return res.data || res.rows || res.Data || res.cariler || []
}

const isValidEfaturaDate = (value) => {
    if (!value) return false
    const str = String(value).trim()
    if (!str) return false
    if (str.startsWith(EMPTY_DATE_SENTINEL)) return false
    return dayjs(str).isValid()
}

const incrementCariKod = (lastKod) => {
    const numeric = parseInt(String(lastKod).replaceAll('.', ''), 10)
    if (!Number.isFinite(numeric)) {
        throw new ApiError(500, `Geçersiz cari_kod formatı: ${lastKod}`)
    }
    const nextStr = String(numeric + 1)
    if (nextStr.length !== 8) {
        throw new ApiError(409, `Cari kod aralığı aşıldı (${CARI_KOD_MAX}).`)
    }
    const formatted = nextStr.replace(/(\d{3})(\d{2})(\d{3})/, '$1.$2.$3')
    if (formatted > CARI_KOD_MAX || formatted < CARI_KOD_MIN) {
        throw new ApiError(409, `Cari kod aralığı aşıldı (${CARI_KOD_MAX}).`)
    }
    return formatted
}

const nextCariKod = async () => {
    const res = await mikroErp.cari.listele({
        CariKod: CARI_KOD_PREFIX,
        Sort: '-cari_kod',
        Size: 1,
        Index: 0
    })
    const rows = extractRows(res)
    if (!rows.length) return CARI_KOD_MIN
    const lastKod = rows[0].cari_kod || rows[0].CariKod || rows[0].kod
    if (!lastKod) return CARI_KOD_MIN
    return incrementCariKod(lastKod)
}

const findCariByVknTckn = async (vknOrTckn) => {
    const res = await mikroErp.cari.listele({ CariVKNTCNo: vknOrTckn, Size: 1 })
    const rows = extractRows(res)
    return rows[0] || null
}

const splitAdSoyad = (full) => {
    const parts = String(full || '').trim().split(/\s+/)
    if (parts.length <= 1) return { isim: parts[0] || '', soyisim: '' }
    const soyisim = parts.pop()
    return { isim: parts.join(' '), soyisim }
}

const resolveCariKisiligi = ({ fatura_tip, fatura }) => {
    if (fatura_tip === 'firma') {
        return {
            vknTckn: fatura.vkn,
            unvan: fatura.unvan,
            vergiDairesi: fatura.vergi_dairesi || ''
        }
    }
    return {
        vknTckn: fatura.tckn,
        unvan: fatura.ad_soyad,
        vergiDairesi: ''
    }
}

const buildCariPayload = ({ cariKod, unvan, vknTckn, vergiDairesi, iletisim }) => {
    const { isim, soyisim } = splitAdSoyad(iletisim.ad_soyad)
    return {
        cari_kod: cariKod,
        cari_unvan1: unvan,
        cari_vdaire_no: vknTckn,
        cari_vdaire_adi: vergiDairesi,
        cari_doviz_cinsi1: 0,
        cari_doviz_cinsi2: 255,
        cari_doviz_cinsi3: 255,
        cari_EMail: iletisim.eposta || '',
        cari_CepTel: iletisim.telefon || '',
        adres: [{
            adr_cadde: '',
            adr_il: '',
            adr_ilce: '',
            yetkili: [{
                mye_isim: isim,
                mye_soyisim: soyisim,
                mye_cep_telno: iletisim.telefon || '',
                mye_email_adres: iletisim.eposta || ''
            }]
        }]
    }
}

const findOrCreateCari = async ({ fatura_tip, fatura, iletisim }) => {
    const { vknTckn, unvan, vergiDairesi } = resolveCariKisiligi({ fatura_tip, fatura })

    let row = await findCariByVknTckn(vknTckn)

    if (!row) {
        const cariKod = await nextCariKod()
        const payload = buildCariPayload({ cariKod, unvan, vknTckn, vergiDairesi, iletisim })
        await mikroErp.callApi('CariKaydetV2', {
            Mikro: { KullaniciKodu: KULLANICI_KODU, cariler: [payload] }
        })
        row = await findCariByVknTckn(vknTckn)
        if (!row) {
            throw new ApiError(502, 'Yeni cari oluşturuldu ancak Mikro ERP sorgusunda bulunamadı.')
        }
    }

    const cariKod = row.cari_kod || row.CariKod || row.kod
    const efaturaTarihi = row.cari_efatura_baslangic_tarihi ?? row.CariEfaturaBaslangicTarihi
    const efaturaMukellefi = isValidEfaturaDate(efaturaTarihi)

    return { cariKod, efaturaMukellefi }
}

const buildSthRow = ({ item, cariKod, tarih }) => ({
    sth_tarih: tarih,
    sth_tip: 1,
    sth_cins: 0,
    sth_normal_iade: 0,
    sth_evraktip: 4,
    sth_evrakno_seri: STH_EVRAKNO_SERI,
    sth_stok_kod: item.stok,
    sth_cari_cinsi: 0,
    sth_cari_kodu: cariKod,
    sth_miktar: item.miktar,
    sth_birim_pntr: 1,
    sth_tutar: item.miktar * item.birim_fiyat,
    sth_aciklama: item.aciklama || '',
    sth_cari_srm_merkezi: '',
    sth_stok_srm_merkezi: '',
    sth_subeno: 0,
    sth_iskonto1: (item.iskonto || 0) * item.miktar,
    sth_isk_mas1: 0,
    sth_giris_depo_no: 2,
    sth_cikis_depo_no: 2
})

const buildChaSeri = (efaturaMukellefi) => {
    const yilSon2 = String(dayjs().year()).slice(-2)
    return (efaturaMukellefi ? 'FXF' : 'FXR') + yilSon2
}

const kaydet = async (body) => {
    const { fatura_tip, fatura, iletisim, stoklar, temsilci, notlar } = body

    const { cariKod, efaturaMukellefi } = await findOrCreateCari({ fatura_tip, fatura, iletisim })

    const tarih = dayjs().format('DD.MM.YYYY')
    const chaSeri = buildChaSeri(efaturaMukellefi)

    const detay = stoklar.map(item => buildSthRow({ item, cariKod, tarih }))

    const firstNot = (notlar && notlar[0]) || ''

    const evrak = {
        cha_tip: 0,
        cha_cinsi: 6,
        cha_normal_Iade: 0,
        cha_evrak_tip: 63,
        cha_cari_cins: 0,
        cha_d_cins: 0,
        cha_d_kur: 1,
        cha_tarihi: tarih,
        cha_evrakno_seri: chaSeri,
        cha_kod: cariKod,
        cha_projekodu: '',
        cha_srmrkkodu: '',
        cha_subeno: 0,
        cha_aciklama: firstNot,
        cha_satici_kodu: temsilci,
        detay,
        evrak_aciklamalari: (notlar || []).map(aciklama => ({ aciklama }))
    }

    const result = await mikroErp.callApi('FaturaKaydetV3', {
        Mikro: { KullaniciKodu: KULLANICI_KODU, evraklar: [evrak] }
    })

    return { cariKod, evrakSeri: chaSeri, result }
}

module.exports = { kaydet }