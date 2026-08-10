const prisma = require('../../services/prisma')

const FATURA_EVRAK_TIP = 63
const DOSYA_CARI_HAREKET = 51

// Servis notu (notlar[0]) fatura kaydında EVRAK_ACIKLAMALARI.egk_evracik1'e yazılıyor. Mikro bu
// notu tek fatura için üç ayrı dosyaya kopyalıyor (16/stok, 21/stok hareket, 51/cari hareket);
// egk_dosyano ve egk_evr_tip filtreleri, seri+sıra çakışması yüzünden başka bir faturanın
// yakalanmasını engelliyor.
// LIKE deseninin sonundaki boşluk şart: '#10997%' deseni '#109970' ile de eşleşirdi.
// Aynı servise (hatalı biçimde) birden fazla fatura kesilmişse en eskisi dönüyor.
// Her iki tablonun da Prisma modeli var (Aciklama, Tahsilat) ama join'i modellerle kurmak iki
// ayrı sorgu gerektirir ve fatura satırını `prisma.tahsilat` üzerinden okumak yanıltıcı olur.
const findByServisNo = async (servisNo) => {
    const rows = await prisma.$queryRaw`
        SELECT TOP 1
            egk_evr_seri AS evrak_seri,
            egk_evr_sira AS evrak_sira,
            cha_Guid     AS evrak_uuid,
            cha_kod      AS cariKod
        FROM EVRAK_ACIKLAMALARI
        INNER JOIN CARI_HESAP_HAREKETLERI
            ON cha_evrakno_seri = egk_evr_seri
           AND cha_evrakno_sira = egk_evr_sira
        WHERE egk_dosyano = ${DOSYA_CARI_HAREKET}
          AND egk_evr_tip = ${FATURA_EVRAK_TIP}
          AND cha_evrak_tip = ${FATURA_EVRAK_TIP}
          AND cha_iptal = 0
          AND egk_iptal = 0
          AND egk_evracik1 LIKE ${`#${servisNo} %`}
        ORDER BY egk_evr_sira, cha_satir_no
    `
    return rows[0] || null
}

module.exports = { findByServisNo }