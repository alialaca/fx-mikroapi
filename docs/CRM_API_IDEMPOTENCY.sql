-- Idempotency kayıtları. (kapsam, anahtar) primary key'i, aynı iş anahtarıyla gelen
-- eşzamanlı isteklerden yalnızca birinin geçmesini sağlayan kilit görevi görür.
--
-- DİKKAT: prisma db push / migrate ÇALIŞTIRILMAMALI — şema canlı Mikro ERP veritabanına
-- map'li, push tüm şemayı senkronize etmeye kalkar. Bu tablo elle oluşturulur, ardından
-- yalnızca `npm run prisma:generate` koşulur.

CREATE TABLE CRM_API_IDEMPOTENCY (
    kapsam     NVARCHAR(32)  NOT NULL,  -- 'fatura', 'tahsilat', ...
    anahtar    NVARCHAR(64)  NOT NULL,  -- fatura icin servis numarasi
    durum      NVARCHAR(16)  NOT NULL,  -- 'islemde' | 'tamam' | 'hata'
    sonuc      NVARCHAR(MAX) NULL,      -- basarili cevabin JSON'i
    hata       NVARCHAR(512) NULL,
    olusturma  DATETIME NOT NULL CONSTRAINT DF_CRM_API_IDEMPOTENCY_olusturma  DEFAULT GETDATE(),
    guncelleme DATETIME NOT NULL CONSTRAINT DF_CRM_API_IDEMPOTENCY_guncelleme DEFAULT GETDATE(),
    CONSTRAINT PK_CRM_API_IDEMPOTENCY PRIMARY KEY (kapsam, anahtar)
);