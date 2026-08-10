const prisma = require('./prisma')
const ApiError = require('../utils/ApiError')

const ISLEMDE = 'islemde'
const TAMAM = 'tamam'
const HATA = 'hata'

const PK_IHLALI = 'P2002'

const kayitAnahtari = ({ kapsam, anahtar }) => ({ kapsam_anahtar: { kapsam, anahtar } })

const durumYaz = (ctx, data) => prisma.idempotency.update({ where: kayitAnahtari(ctx), data })

const tamamla = async (ctx, sonuc) => {
    await durumYaz(ctx, { durum: TAMAM, sonuc: JSON.stringify(sonuc), hata: null })
    return sonuc
}

const yurut = async (ctx, islem) => {
    try {
        return await tamamla(ctx, await islem())
    } catch (err) {
        // Kaydı işaretlerken çıkan bir hata, asıl hatanın üzerini örtmemeli.
        await durumYaz(ctx, { durum: HATA, hata: String(err.message).slice(0, 512) }).catch(() => {})
        throw err
    }
}

const tekrarEden = async (ctx, islem) => {
    const { kapsam, anahtar, mutabakat } = ctx
    const kayit = await prisma.idempotency.findUnique({ where: kayitAnahtari(ctx) })

    if (kayit.durum === TAMAM) return JSON.parse(kayit.sonuc)

    // 'islemde' veya 'hata': kayıt kaynak sistemde gerçekten oluşmuş olabilir — ör. Mikro
    // commit etti ama biz cevabı alamadık. Yeniden denemeden önce oraya sor.
    const mevcut = await mutabakat()
    if (mevcut) return tamamla(ctx, mevcut)

    // Yalnızca 'hata' durumundaki kaydı yeniden denemeye al. Koşullu update, aynı anda gelen
    // iki retry'dan yalnızca birinin geçmesini sağlıyor.
    const { count } = await prisma.idempotency.updateMany({
        where: { kapsam, anahtar, durum: HATA },
        data: { durum: ISLEMDE, hata: null }
    })
    if (count === 0) {
        throw new ApiError(409, `Bu ${kapsam} işlemi (${anahtar}) hâlihazırda sürüyor.`)
    }

    return yurut(ctx, islem)
}

// islem()'i, aynı (kapsam, anahtar) için en fazla bir kez başarıyla çalışacak şekilde koşar.
// Tekrar eden istek, ilk çağrının sonucunu aynen geri alır.
// mutabakat(): kaydın kaynak sistemde gerçekten var olup olmadığını sorgular; varsa islem()'in
// döndüreceği ile aynı şekilde bir sonuç, yoksa null döner.
const calistir = async (ctx, islem) => {
    const { kapsam, anahtar, mutabakat } = ctx

    try {
        await prisma.idempotency.create({ data: { kapsam, anahtar, durum: ISLEMDE } })
    } catch (err) {
        if (err.code !== PK_IHLALI) throw err
        return tekrarEden(ctx, islem)
    }

    // Idempotency kaydı olmaması, kaydın kaynak sistemde de olmadığı anlamına gelmiyor: bu tablo
    // devreye girmeden önce oluşturulmuş ya da API dışından girilmiş olabilir. İşlemi koşmadan önce
    // sor — mutabakat burada patlarsa yurut() kaydı 'hata'ya çekiyor, 'islemde'de asılı kalmıyor.
    return yurut(ctx, async () => (await mutabakat()) || islem())
}

module.exports = { calistir }