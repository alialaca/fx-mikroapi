# POST /fatura — Manuel Test/Doğrulama Planı

## Context

`POST /fatura` endpoint'i `feat/fatura-endpoint` branch'inde. Unit test altyapısı yok; prod Mikro ERP dikkatli kullanılıyor (düşük fiyatlı test stoku + düşük miktar). Bu plan elle doğrulama senaryolarını ve her koşunun ürettiği ERP kayıtlarının temizlik listesini içerir.

Plan yeniden koşulabilir (regression amaçlı): her yeni koşuda **yeni bir temizlik tablosu** doldurulur, oluşan fatura/cari kayıtları koşu sonunda ERP DB'den manuel silinir.

## Ön Koşullar

- `.env` dolu: `MIKRO_ERP_API_URL`, `MIKRO_ERP_KULLANICI_KODU`, `MIKRO_ERP_SIFRE`, `MIKRO_ERP_API_KEY`, `ACCESS_TOKEN`, `PORT`.
- Servis ayakta (`node ./bin/www`). Rotalar otomatik mount edilir.
- Auth: her istekte `Authorization: Bearer <ACCESS_TOKEN>`.
- Test değerleri:
  - **Mevcut cari (B grubu):** `cari_kod = 120.12.711`. VKN/TCKN ve `cari_efatura_fl` değeri testten önce `CariListesiV3({CariKod:'120.12.711'})` ile çekilir.
  - **Yeni cari (C grubu):** rastgele (ör. zaman damgalı) VKN/TCKN + unvan.
  - **Stok:** prod'daki test stok kodu (`SRV01` + `FXYP0014` örnek veride kullanıldı).

## Servis Davranışı (test beklentileri için)

- **e-Fatura mükellefi kontrolü:** `cari.cari_efatura_fl` (bit / boolean). `true` veya `1` → mükellef. `false/0/null` → değil.
- **Yeni cari oluştururken mükellef durumu:** `EMukellefSorgulamaV2` çağrılır (VKN/TCKN ile). Response `Data.EFatura/EIrsaliye/EKamuKurumu` → yeni cari payload'ında `cari_efatura_fl / cari_eirsaliye_fl / cari_kamu_kurumu_fl` olarak 1/0 yazılır. Böylece aynı istekte oluşturulan faturanın serisi doğru seçilir (EFatura=true ise FXF{YY}).
- **cha evrak serisi:** mükellefse `FXF{YY}`, değilse `FXR{YY}`. `YY` = içinde bulunulan yılın son 2 hanesi.
- **sth evrak serisi:** sabit `AS44`. Sıra alanları (`sth_evrakno_sira`, `cha_evrakno_sira`) payload'a eklenmez, Mikro atar.
- **İskonto:** body'de birim bazlı; servis `sth_iskonto1 = miktar × iskonto` olarak toplam gönderir.
- **Bedelsiz fatura:** toplam net `Σ miktar × (birim_fiyat − iskonto) ≈ 0` ise `kdv_istisna_kodu = 351` eklenir. Aksi halde alan gönderilmez.
- **Şahıs cari kaydı (yeni):** `cari_unvan1 = <AD>`, `cari_unvan2 = <SOYAD>` (ad_soyad son kelimeden split). Firma kaydında ikisi de `unvan` ile aynı.
- **Telefon:** başındaki 0'lar kırpılır (Mikro "başında sıfırsız" ister).
- **Hata:** Mikro iş hatası (`result[0].IsError:true` veya `StatusCode≥400`) `ApiError`'a çevrilir.

## ERP Yan Etki Loglaması (kritik — manuel silme için)

Her koşu için **Temizlik Tablosu** doldurulur. Kaynaklar: HTTP response `{cariKod, evrakSeri, result}`, servis `mikroErp.call` logları, Mikro UI.

### Temizlik Tablosu Şablonu

| Senaryo | Zaman | Yeni CARI kod | FATURA seri / sıra | kdv_istisna_kodu | Not |
|---|---|---|---|---|---|
| B1 | | — | FXR26 / `<sira>` | yok | 120.12.711 mevcut cari |
| B4 | | — | FXR26 / `<sira>` | yok | 2 kalem |
| B5 | | — | FXR26 / `<sira>` | yok | iskonto birim bazlı |
| B6 | | — | FXR26 / `<sira>` | **351** | bedelsiz (birim_fiyat = iskonto) |
| C1 | | 120.1X.YYY | FXR26 / `<sira>` | yok | yeni firma |
| C2 | | 120.1X.YYY | FXR26 / `<sira>` | yok | yeni şahıs; unvan1/unvan2 split teyit |
| D1 | | — | — | — | hata — fatura oluşmamalı |

## Risk Azaltma

- `miktar = 1`, `birim_fiyat ≤ 1–5 TL`; B5/B6 örnekteki değerlerle.
- Her senaryo sonrası Mikro UI'dan doğrula (fatura/cari var, alan değerleri beklenen).
- B senaryoları önce (cari üretmiyor), sonra C (yeni cari).

## Senaryolar

### A. Validation (ERP'ye gitmemeli — HTTP 400)

| Id | Mutasyon | Beklenen |
|---|---|---|
| A1 | `fatura_tip` eksik | 400 |
| A2 | firma + `vkn` yok | 400 |
| A3 | firma + `vkn` 11 hane | 400 |
| A4 | sahis + `tckn` yok | 400 |
| A5 | sahis + `tckn` 10 hane | 400 |
| A6 | `iletisim` eksik | 400 |
| A7 | `iletisim.eposta` geçersiz | 400 |
| A8 | `stoklar=[]` | 400 |
| A9 | `miktar=0` | 400 |
| A10 | `birim_fiyat=-5` | 400 |
| A11 | `temsilci` eksik | 400 |
| A12 | `depo` eksik | 400 |

**Başarı:** hepsi 400, log'ta `mikroErp.call` yok.

### B. Mevcut cari (120.12.711)

Ön koşul: `120.12.711`'in VKN/TCKN'i ve `cari_efatura_fl` değeri bilinir. Beklenen seri `FXR` veya `FXF` bu flag'a göre.

| Id | Ayırt edici | Beklenen |
|---|---|---|
| B1 | Tek kalem, iskonto=0 | 200; `sth_tutar = miktar×birim_fiyat`; `sth_iskonto1=0`; `kdv_istisna_kodu` yok |
| B4 | İki farklı stok, iskonto=0 | 200; `detay.length=2`; `kdv_istisna_kodu` yok |
| B5 | İki kalem; `iskonto>0` ama `<birim_fiyat` (kısmi iskonto) | 200; `sth_iskonto1 = iskonto×miktar`; `kdv_istisna_kodu` yok |
| B6 | İki kalem; **her kalem için `iskonto = birim_fiyat`** (net 0) | 200; `evrakSeri=FXR26`; **Mikro UI'da `kdv_istisna_kodu = 351`** |

### C. Yeni cari (Mikro'da yok)

Ön koşul: rastgele VKN/TCKN ERP'de yok (test öncesi `CariListesiV3` ile boş teyit).

Beklenen çağrı sırası (log):
1. `CariListesiV3` (VKN/TCKN ile — boş)
2. `CariListesiV3` × N (nextCariKod binary search) ve `EMukellefSorgulamaV2` paralel
3. `CariKaydetV2` (yeni cari — mükellef bayrakları ile)
4. `CariListesiV3` (VKN/TCKN ile — bulmalı)
5. `FaturaKaydetV3`

| Id | Ayırt edici | Beklenen |
|---|---|---|
| C1 | `fatura_tip='firma'` | `cari_unvan1=fatura.unvan`, `cari_unvan2=fatura.unvan`, `cari_vdaire_no=VKN`, `cari_vdaire_adi=vergi_dairesi`; yetkili mye_isim/soyisim `iletisim.ad_soyad`'tan split; `evrakSeri=FXR26` |
| C2 | `fatura_tip='sahis'`, `fatura.ad_soyad='Ali Veli'` | **`cari_unvan1='Ali'`, `cari_unvan2='Veli'`** (AD/SOYAD split); `cari_vdaire_no=TCKN`; `cari_vdaire_adi=''`; `evrakSeri=FXR26` |
| C3 | `fatura_tip='firma'` — EFatura mükellefi bilinen bir VKN | `EMukellefSorgulamaV2.Data.EFatura=true`; yeni cari `cari_efatura_fl=1`; **`evrakSeri=FXF26`** (aynı çağrıda serinin doğru seçildiğini teyit) |

### D. Hata yolları

| Id | Mutasyon | Beklenen |
|---|---|---|
| D1 | `stoklar[0].stok` geçersiz (`YOKTURBUSTOK`) | 400/502 `ApiError`; mesaj "Mikro ERP FaturaKaydetV3: ... Stok kodu bulunamadı!"; fatura oluşmamalı |

### E. Response şema doğrulama

- E1: İlk canlı `CariListesiV3` response'unda `cari_kod`, `cari_efatura_fl`, `cari_vdaire_no` alan adlarını logdan teyit et.

## Örnek Request (B1)

```bash
curl -X POST http://localhost:$PORT/fatura \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "temsilci":"a.muhammed","olusturan":"44","depo":2,
    "fatura_tip":"sahis",
    "fatura":{"tckn":"25934632790","ad_soyad":"ABDULLAH CABUĞA"},
    "iletisim":{"ad_soyad":"Abdullah Cabuğa","telefon":"5455270721","eposta":""},
    "stoklar":[{"stok":"SRV01","miktar":1,"birim_fiyat":2000,"iskonto":0,"aciklama":""}],
    "notlar":["Test B1"]
  }'
```

## Örnek Request (B6 — bedelsiz)

```bash
curl -X POST http://localhost:$PORT/fatura \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "temsilci":"a.muhammed","olusturan":"44","depo":2,
    "fatura_tip":"sahis",
    "fatura":{"tckn":"25934632790","ad_soyad":"ABDULLAH CABUĞA"},
    "iletisim":{"ad_soyad":"Abdullah Cabuğa"},
    "stoklar":[
      {"stok":"SRV01","miktar":1,"birim_fiyat":3168.95,"iskonto":3168.95,"aciklama":""},
      {"stok":"FXYP0014","miktar":1,"birim_fiyat":3168.95,"iskonto":3168.95,"aciklama":""}
    ],
    "notlar":["Test B6 — bedelsiz"]
  }'
```

## Yürütme Sırası

1. A1–A12 (validation — ERP dokunmasız)
2. B1 → B4 → B5 → B6 (mevcut cari, düşük risk)
3. E1 doğrulaması (alan adı teyit)
4. C1 → C2 (yeni cari)
5. D1

## Başarı Checklist

- [ ] A1–A12 hepsi 400, ERP çağrısı yok
- [ ] B1 `sth_tutar` doğru, `kdv_istisna_kodu` yok
- [ ] B4 iki kalem detay, `kdv_istisna_kodu` yok
- [ ] B5 `sth_iskonto1 = iskonto×miktar`, `kdv_istisna_kodu` yok
- [ ] B6 **`kdv_istisna_kodu=351` Mikro UI'da görünüyor**
- [ ] C1 firma kaydında `cari_unvan1=cari_unvan2=fatura.unvan`
- [ ] C2 **şahıs kaydında `cari_unvan1=AD`, `cari_unvan2=SOYAD`**
- [ ] C1/C2 akışında beklenen ERP çağrı sırası görülüyor, kod `120.1X.YYY` formatında
- [ ] `evrakSeri` her senaryoda cari'nin `cari_efatura_fl` değerine göre (FXR/FXF)
- [ ] D1 `ApiError` yayıldı, logda detay
- [ ] E1 alan adları teyit edildi

## Koşu Sonrası Temizlik

Doldurulmuş Temizlik Tablosu ERP admin'ine iletilir:
- **Yeni cariler** (C1, C2) → cari tablosundan `cari_kod` ile sil
- **Faturalar** (B1, B4, B5, B6, C1, C2) → sth ve cha tablolarından `(cha_evrakno_seri, cha_evrakno_sira)` ile sil

## Bilinen Açık Noktalar

- Binary search `nextCariKod` 120.1X.YYY aralığında monotonik doluluk varsayar; deleted kodlar yüzünden gap varsa yanlışlıkla erken konverj olabilir.
- B6'da `kdv_istisna_kodu` UI'da görünmüyorsa, alan adı Postman'deki exact isim/casing ile eşleşmeli (`kdv_istisna_kodu` tinyint). Alternatif isim: `kdv_istisna_kodu` (Postman örneğinde bu göründü). Gerekirse alan adı service'te bu isme çevrilir.
