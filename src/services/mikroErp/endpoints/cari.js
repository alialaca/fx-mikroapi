const { callApi } = require('../client')

const asArray = (v) => (Array.isArray(v) ? v : [v])

// Kayıt/Güncelleme: veri dizisi Mikro envelope'unun İÇİNE girer
const kaydet = (cariler) =>
    callApi('CariKaydetV2', { Mikro: { cariler: asArray(cariler) } })

const guncelle = (cariler) =>
    callApi('CariGuncelleV2', { Mikro: { cariler: asArray(cariler) } })

// Listeleme: filtre alanları ROOT seviyesine gider (Mikro dışında)
const listele = ({
    CariKod = '',
    CariVKNTCNo = '',
    TarihTipi = 2,
    IlkTarih = '1899-12-30',
    SonTarih = '2099-12-31',
    Sort = '-cari_kod',
    Size = 50,
    Index = 0
} = {}) => callApi('CariListesiV3', {
    CariKod,
    CariVKNTCNo,
    TarihTipi,
    IlkTarih,
    SonTarih,
    Sort,
    Size: String(Size),
    Index
})

module.exports = { kaydet, guncelle, listele }
