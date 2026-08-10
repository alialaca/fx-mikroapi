const dayjs = require('dayjs')
const mikroErp = require('../../services/mikroErp')
const idempotency = require('../../services/idempotency')
const ApiError = require('../../utils/ApiError')
const { findByServisNo } = require('./fatura.model')

const CARI_KOD_NUM_MIN = 12010001
const CARI_KOD_NUM_MAX = 12019999
const toCariKod = (n) => String(n).replace(/(\d{3})(\d{2})(\d{3})/, '$1.$2.$3')
const ISTISNA_KODU_BEDELSIZ = 351
const KULLANICI_KODU = 'SRV'
const STH_EVRAKNO_SERI = 'AS44'
const SERVIS_PROJE_KODU = '1'

const extractRows = (res) => {
    if (!res) return []
    if (Array.isArray(res)) return res
    const nested = res.result?.[0]?.Data
    if (nested) {
        return nested.CariListesi || nested.cariler || nested.Data || []
    }
    return res.data || res.rows || res.Data || res.cariler || []
}

const cariKodExists = async (kod) => {
    const res = await mikroErp.cari.listele({ CariKod: kod, Size: 1 })
    return extractRows(res).length > 0
}

const nextCariKod = async () => {
    // CariListesiV3 CariKod filtresi exact-match; prefix sorgusu yok.
    // 120.10.001–120.19.999 aralığında monotonik doluluğu varsayarak max kodu binary search ile bul.
    let lo = CARI_KOD_NUM_MIN
    let hi = CARI_KOD_NUM_MAX
    let lastFound = lo - 1
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (await cariKodExists(toCariKod(mid))) {
            lastFound = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    const next = lastFound + 1
    if (next > CARI_KOD_NUM_MAX) {
        throw new ApiError(409, `Cari kod aralığı aşıldı (${toCariKod(CARI_KOD_NUM_MAX)}).`)
    }
    return toCariKod(next)
}

const findCariByVknTckn = async (vknOrTckn) => {
    const res = await mikroErp.cari.listele({ CariVKNTCNo: vknOrTckn, Size: 1 })
    const rows = extractRows(res)
    return rows[0] || null
}

const normalizeTel = (tel) => String(tel || '').replace(/^0+/, '')

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
            unvan1: fatura.unvan,
            unvan2: fatura.unvan,
            vergiDairesi: fatura.vergi_dairesi || ''
        }
    }
    const { isim, soyisim } = splitAdSoyad(fatura.ad_soyad)
    return {
        vknTckn: fatura.tckn,
        unvan1: isim,
        unvan2: soyisim,
        vergiDairesi: ''
    }
}

const sorgulaMukellefFlags = async (vknTckn) => {
    const res = await mikroErp.cari.eMukellefSorgula(vknTckn)
    const data = res?.result?.[0]?.Data || {}
    return {
        cari_efatura_fl: data.EFatura === true ? 1 : 0,
        cari_eirsaliye_fl: data.EIrsaliye === true ? 1 : 0,
        cari_kamu_kurumu_fl: data.EKamuKurumu === true ? 1 : 0
    }
}

const buildCariPayload = ({ cariKod, unvan1, unvan2, vknTckn, vergiDairesi, iletisim, mukellefFlags }) => {
    const { isim, soyisim } = splitAdSoyad(iletisim.ad_soyad)
    return {
        cari_kod: cariKod,
        cari_unvan1: unvan1,
        cari_unvan2: unvan2,
        cari_vdaire_no: vknTckn,
        ...mukellefFlags,
        cari_vdaire_adi: vergiDairesi,
        cari_doviz_cinsi1: 0,
        cari_doviz_cinsi2: 255,
        cari_doviz_cinsi3: 255,
        cari_EMail: iletisim.eposta || '',
        cari_CepTel: normalizeTel(iletisim.telefon),
        adres: [{
            adr_cadde: '',
            adr_il: '',
            adr_ilce: '',
            yetkili: [{
                mye_isim: isim,
                mye_soyisim: soyisim,
                mye_cep_telno: normalizeTel(iletisim.telefon),
                mye_email_adres: iletisim.eposta || ''
            }]
        }]
    }
}

const findOrCreateCari = async ({ fatura_tip, fatura, iletisim }) => {
    const { vknTckn, unvan1, unvan2, vergiDairesi } = resolveCariKisiligi({ fatura_tip, fatura })

    let row = await findCariByVknTckn(vknTckn)

    if (!row) {
        const [cariKod, mukellefFlags] = await Promise.all([
            nextCariKod(),
            sorgulaMukellefFlags(vknTckn)
        ])
        const payload = buildCariPayload({ cariKod, unvan1, unvan2, vknTckn, vergiDairesi, iletisim, mukellefFlags })
        await mikroErp.callApi('CariKaydetV2', {
            Mikro: { KullaniciKodu: KULLANICI_KODU, cariler: [payload] }
        })
        row = await findCariByVknTckn(vknTckn)
        if (!row) {
            throw new ApiError(502, 'Yeni cari oluşturuldu ancak Mikro ERP sorgusunda bulunamadı.')
        }
    }

    const cariKod = row.cari_kod || row.CariKod || row.kod
    const efaturaMukellefi = row.cari_efatura_fl === true || row.cari_efatura_fl === 1
    const odemePlanNoRaw = Number(row.cari_odemeplan_no ?? 0)
    const odemePlanNo = odemePlanNoRaw > 0 ? odemePlanNoRaw : 1

    return { cariKod, efaturaMukellefi, odemePlanNo }
}

const buildSthRow = ({ item, cariKod, tarih, odemePlanNo }) => ({
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
    sth_cikis_depo_no: 2,
    sth_odeme_op: odemePlanNo
})

const buildChaSeri = (efaturaMukellefi) => {
    const yilSon2 = String(dayjs().year()).slice(-2)
    return (efaturaMukellefi ? 'FXF' : 'FXR') + yilSon2
}

const logFaturaError = ({ vkn, cariKod, err }) => {
    const ts = new Date().toISOString()
    const status = err?.statusCode || err?.response?.status || 500
    const message = err?.message || 'Bilinmeyen hata'
    console.error(`[${ts}] [fatura.kaydet] vkn=${vkn || '-'} cariKod=${cariKod || '-'} status=${status} message=${message}`)
    if (err?.stack) console.error(err.stack)
}

const faturaOlustur = async (body) => {
    const { fatura_tip, fatura, iletisim, stoklar, temsilci, notlar } = body
    const vkn = fatura?.vkn || fatura?.tckn
    let cariKod

    try {
        const cari = await findOrCreateCari({ fatura_tip, fatura, iletisim })
        cariKod = cari.cariKod
        const { efaturaMukellefi, odemePlanNo } = cari

        const tarih = dayjs().format('DD.MM.YYYY')
        const chaSeri = buildChaSeri(efaturaMukellefi)

        const detay = stoklar.map(item => buildSthRow({ item, cariKod, tarih, odemePlanNo }))

        const firstNot = notlar[0]

        const totalNet = stoklar.reduce(
            (sum, it) => sum + ((it.birim_fiyat || 0) - (it.iskonto || 0)) * (it.miktar || 0),
            0
        )
        const isBedelsiz = Math.abs(totalNet) < 0.001

        const evrak = {
            cha_tip: 0,
            cha_cinsi: 6,
            cha_normal_Iade: 0,
            cha_evrak_tip: 63,
            cha_cari_cins: 0,
            cha_d_cins: 0,
            cha_d_kur: 1,
            cha_tarihi: tarih,
            cha_vade: odemePlanNo,
            cha_evrakno_seri: chaSeri,
            cha_kod: cariKod,
            cha_projekodu: SERVIS_PROJE_KODU,
            cha_srmrkkodu: '',
            cha_subeno: 0,
            cha_aciklama: firstNot,
            cha_satici_kodu: temsilci,
            detay,
            evrak_aciklamalari: notlar.map(aciklama => ({ aciklama }))
        }

        if (isBedelsiz) {
            evrak.kdv_istisna_kodu = ISTISNA_KODU_BEDELSIZ
        }

        const result = await mikroErp.callApi('FaturaKaydetV3', {
            Mikro: { KullaniciKodu: KULLANICI_KODU, evraklar: [evrak] }
        })

        const kayit = result?.result?.[0]?.Data?.list?.[0] || {}
        return {
            evrak_seri: kayit.evrakno_seri || chaSeri,
            evrak_sira: Number(kayit.evrakno_sira),
            evrak_uuid: kayit.cariHarGuid,
            cariKod
        }
    } catch (err) {
        logFaturaError({ vkn, cariKod, err })
        throw err
    }
}

// Bir servis numarasına ömrü boyunca tek fatura kesiliyor; tekrar eden istek yeni evrak açmadan
// ilk çağrının cevabını geri alıyor.
const kaydet = async (body) => {
    const servisNo = body.servis_no

    return idempotency.calistir(
        { kapsam: 'fatura', anahtar: servisNo, mutabakat: () => findByServisNo(servisNo) },
        () => faturaOlustur(body)
    )
}

module.exports = { kaydet }