# Mikro ERP API Entegrasyonu

`src/services/mikroErp/` altındaki servis, Mikro ERP V16 REST API'sine (Postman: `docs/MikroAPI.postman_collection_V16.json`) tek giriş noktasıyla erişir. Kimlik doğrulama stateless: her istek, body'deki `Mikro.Sifre` alanında günlük MD5 hash'i taşır. Login/session yoktur.

## Mimari Özet

```
src/services/mikroErp/
├── config.js               # env okuma + sabit config
├── client.js               # callApi(methodName, payload) — tek çağrı noktası
├── index.js                # dışa açılan API
└── endpoints/
    └── cari.js             # CariKaydetV2 / CariGuncelleV2 / CariListesiV3
```

Akış:

1. `callApi(methodName, payload)` çağrılır.
2. Payload, sabit firma/kullanıcı bilgileriyle ve o anki `Sifre` değeri ile `{ Mikro: { ... } }` envelope'una sarılır.
3. `POST /Api/APIMethods/<methodName>` atılır, `res.data` döndürülür.
4. Hatalar `ApiError(status, message)`'a dönüştürülür (mevcut `errorHandler` middleware'i istemciye standart biçimde iletir).

## Auth

Her istekte envelope içinde iki alan gönderilir:

- **`ApiKey`** — `MIKRO_ERP_API_KEY` env değişkeninden olduğu gibi. Bu server konfigürasyonu her çağrıda zorunlu tutar; yoksa `"Json da ApiKey bilgisi eksik!"` hatası döner.
- **`Sifre`** — günlük MD5:
  ```js
  md5(`${dayjs().format('YYYY-MM-DD')} ${MIKRO_ERP_SIFRE}`)
  ```
  Girdi `YYYY-MM-DD` + **tek boşluk** + plaintext parola. Çıktı 32 karakter hex. İstek başına hesaplanır (cache yok); gün değişince doğal olarak yeni hash üretilir. Tarih, Node process'inin **yerel saat dilimine** göredir. ERP on-prem TR'de olduğu için sunucu saati TR olduğu sürece uyum sağlanır.

## Env Değişkenleri

| Değişken | Zorunlu | Varsayılan |
|---|---|---|
| `MIKRO_ERP_API_URL` | evet | — |
| `MIKRO_ERP_KULLANICI_KODU` | evet | — |
| `MIKRO_ERP_SIFRE` | evet | — |
| `MIKRO_ERP_API_KEY` | evet | — |
| `MIKRO_ERP_FIRMA_KODU` | hayır | `FIXPRO` |
| `MIKRO_ERP_CALISMA_YILI` | hayır | içinde bulunulan yıl |
| `MIKRO_ERP_TIMEOUT_MS` | hayır | `30000` |

## Servis Dosyasından Kullanım

Tüm wrapper'lar `Promise` döndürür — herhangi bir modülün service dosyasında doğrudan `await` edilebilir.

```js
// src/modules/cari/cari.service.js
const Cari = require('./cari.model')
const mikroErp = require('../../services/mikroErp')

class CariService {
    async create(data) {
        const local = await Cari.create(data)

        const erpResult = await mikroErp.cari.kaydet({
            cari_kod: local.kod,
            cari_unvan1: local.unvan,
            cari_vdaire_no: local.vkn,
            cari_vdaire_adi: local.vergiDairesi,
            cari_doviz_cinsi1: 0,
            adres: [{
                adr_cadde: local.cadde,
                adr_il: local.il,
                adr_ilce: local.ilce
            }]
        })

        return { local, erp: erpResult }
    }

    async listFromErp(filter) {
        return mikroErp.cari.listele(filter)
    }
}

module.exports = new CariService()
```

Hatalar zaten `ApiError` olduğundan controller'da `next(err)` çağrısı dışında özel bir işlem gerekmez; `async` controller'larda try/catch veya bir `catchAsync` wrapper'ı yeterli olur.

## Yeni Endpoint Nasıl Eklenir

Postman'de görülen tüm method'lar aynı kalıbı izler: `POST /Api/APIMethods/<MethodAdi>` + `{ Mikro: { FirmaKodu, CalismaYili, KullaniciKodu, ApiKey, Sifre, ...payload } }`. Dolayısıyla yeni bir endpoint eklemek çoğu zaman tek bir fonksiyondan ibarettir.

### 1. Uygun dosyayı aç / oluştur

Domain başına bir dosya: `src/services/mikroErp/endpoints/<domain>.js`. Örnek domain'ler: `cari`, `siparis`, `tahsilat`, `stok`, `dekont`, `servisIsEmri`.

### 2. Wrapper fonksiyonu yaz

`callApi(methodName, payload)` çağrısından başka bir şey gerekmez. Envelope sarma ve `Sifre` hesabı `client.js` tarafından yapılır, ama **payload'ın yapısı Mikro API'nin iki farklı kalıbına göre değişir** — bu fark endpoint'in türünü belirler:

#### Kalıp A — Kayıt/Güncelleme/Silme (veri `Mikro`'nun İÇİNDE)

Postman gövdesinde `cariler`, `evraklar`, `satirlar`, `isemirleri`, `siparisler` gibi diziler `Mikro` envelope'unun içinde görünür. Bu durumda payload'ı `{ Mikro: { ... } }` özel anahtarıyla verin; `client.js` bu alanı auth alanlarıyla birleştirir:

```js
const kaydet = (siparisler) =>
    callApi('SiparisKaydetV2', { Mikro: { siparisler: asArray(siparisler) } })
```

#### Kalıp B — Listeleme/Sorgu (filtreler ROOT seviyesinde)

`CariListesiV3`, `SiparisListesiV3` gibi listeleme endpoint'lerinde Postman gövdesinde `CariKod`, `TarihTipi`, `Sort`, `Size`, `Index` gibi alanlar `Mikro`'nun DIŞINDA, root seviyesinde durur. Bu durumda payload'ı doğrudan root nesnesi olarak verin:

```js
const listele = (filter = {}) =>
    callApi('SiparisListesiV3', filter)
```

#### Tam örnek

```js
// src/services/mikroErp/endpoints/siparis.js
const { callApi } = require('../client')

const asArray = (v) => (Array.isArray(v) ? v : [v])

const kaydet = (siparisler) =>
    callApi('SiparisKaydetV2', { Mikro: { siparisler: asArray(siparisler) } })

const sil = (siparisler) =>
    callApi('SiparisSilV2', { Mikro: { siparisler: asArray(siparisler) } })

const listele = (filter = {}) =>
    callApi('SiparisListesiV3', filter)

module.exports = { kaydet, sil, listele }
```

> **Hangi kalıbı kullanmalıyım?** Postman örneğine bakın: alan `"Mikro": { ... }` bloğunun içinde mi yoksa root seviyesinde mi? İçindeyse Kalıp A, dışındaysa Kalıp B. Her iki kalıbın alanlarını aynı payload'da karıştırabilirsiniz: `{ Mikro: { cariler: [...] }, ExtraRootField: 1 }` — `Mikro` anahtarı ayrılır, kalanı root'a gider.

### 3. `index.js` üzerinden expose et

```js
// src/services/mikroErp/index.js
const siparis = require('./endpoints/siparis')
module.exports = { /* ... */, siparis }
```

### 4. Service katmanından kullan

Modül `service.js` dosyası ERP wrapper'ını `require` eder ve iş mantığını (Prisma çağrıları, doğrulama, dönüşüm) orkestre eder. ERP wrapper'ları **yalnızca HTTP çağrısını** yapar; iş kuralları service katmanında kalır.

## Konvansiyonlar

- **Method adları Postman'deki tam isimle** (`CariKaydetV2`, `SiparisListesiV3`) kullanılır. Yol büyük/küçük harf farkı server tarafından normalize ediliyor; biz `/Api/APIMethods/<MethodAdi>` kalıbında tutuyoruz.
- **Listeleme endpoint'leri** `Size`, `Index`, `Sort` alanlarını string olarak bekliyor; sayıları string'e çevirmeyi unutma.
- **Tarih alanları** `YYYY-MM-DD` formatında (`"1899-12-30"` = boş tarih konvansiyonu).
- **`cari_doviz_cinsi2/3` vb. boş döviz alanları** `255` değerini bekliyor (Mikro konvansiyonu).
- **Toplu kayıt** mantığı yaygın: birçok method `cariler: []`, `evraklar: []`, `satirlar: []` gibi diziler alır. Wrapper'ı tek kayıt + dizi ikisini de kabul edecek şekilde yazmak pratik (`asArray` helper'ı gibi).

## Hata Davranışı

| Durum | Davranış |
|---|---|
| Timeout / ağ hatası | `ApiError(502, ...)` |
| ERP business hatası | Upstream status + mesaj ile `ApiError` |
| Eksik env | İlk çağrıda `ApiError(500)` |

## Sınırlamalar / Gelecek İşler

- Circuit breaker / rate limiting yok. ERP birden fazla servisten yoğun çağrılacaksa p-limit/bottleneck eklenebilir.
- `Logoff`/`HealthCheck`/`LoggerDone` endpoint'leri kullanılmıyor (diğer çağrıların ön koşulu değiller, standalone utility'ler).
