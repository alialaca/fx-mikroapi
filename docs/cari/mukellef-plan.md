# Yeni cari kayıtlarında mükellef durum sorgulama

Yeni cair kayıtlarında aşağıdaki sorgu ile carinin emukellef olup olmadığı sorgulanmalı ve sonuca göre cari detayında cari_efatura_fl alanının true/1 olarak günecllenmesi gerekmektedir. Bu request postman dokumasyonunda yer almamaktadır.

URL: POST /API/APIMethods/EMukellefSorgulamaV2

# body
```json
{
  "Mikro": {
    "FirmaKodu": "FIXPRO",
    "CalismaYili": "2026",
    "KullaniciKodu": "{{ _.USER }}",
    "Sifre": "{{PASS_HASH}}",
    "ApiKey": "{{API_KEY}}",
    "EMukellef": {
      "VKN_TCKN": "3870583159"
    }
  }
}
``` 

# response
```json
{
  "result": [
    {
      "StatusCode": 200,
      "Data": {
        "EFatura": true,
        "EArsiv": false,
        "EIrsaliye": true,
        "EKamuKurumu": false
      },
      "ErrorMessage": "",
      "IsError": false
    }
  ]
}
``` 