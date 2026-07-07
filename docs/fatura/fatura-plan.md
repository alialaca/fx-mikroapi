# Fatura Oluşturma Modülü

Bu modülde POST /fatura endpointi tanımlanacak. Endpoint işleyişi şu şekilde olacak:
1 - Cari Oluşturma (Eğer varsa mevcut olan kullanılacak)
2 - Doğrudan fatura oluşturma

## Yöntem
- mikroErp servisi üzerinden işlemler yapılacak
- Fatura için FaturaKaydetV3 kullanılacak
- Faturada kullanılacak alanlar için örnek verilere docs/fatura/cari-hareket.json ve docs/fatura/stok-hareketleri.json üzerindeki veriler olacak.
- request body'de cari bilgileri (vkn/tckn, unvan veya ad soyad, adres), satır bilgileri (stok kod, miktar, birim fiyat, iskonto), sth (stok hareketleri) için evrak seri, projekodu, cha (cari hesap hareketleri) için projekodu ve belge açıklama alanları gelecek.

evrak_sira belirlemeye gerek yok sth ve cha için.
sth_evrak_seri AS44 değeri olacak. sth_evrakno_sira otomatik atanıyor, bizimt arafımızdan gönderilmeyecek.
vkn 10 hane iken tckn 11 hane. Bu nedenle validasyon bunu göz önünde bulundurmalı.
cha_evrakno_seri FXR26 veya FXF26 olabilir. Carinin efatura mükellefiyeti durumuna göre belirlenir. Bu değer cari için cari_efatura_baslangic_tarihi değeri eğer geçerli bir tarih ise FXF eğer değilse FXR olacak. Buradaki 26 ifadesi 2026 yılında olduğumuz için. Mevcut yılın son iki karakteri alınacak.
vari sorgulamak için doğrudan CariListesiV3 üzerinden CariVKNTCKNNo alanı ile sorgus yapabilirsin.
