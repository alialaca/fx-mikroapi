const Joi = require('joi')

// Servis notu her zaman notlar[0]'da ve şu formatta gelir:
// "#10997 numaralı servis işlemi faturası. SN:1250365390"
// Yakalanan servis numarası, faturanın idempotency anahtarı olarak kullanılıyor.
const SERVIS_NO_PATTERN = /^#(\d+)\s/

const firmaSchema = Joi.object().keys({
    vkn: Joi.string().length(10).pattern(/^\d+$/).required(),
    unvan: Joi.string().required(),
    vergi_dairesi: Joi.string().allow('', null),
    tckn: Joi.any().strip(),
    ad_soyad: Joi.any().strip()
})

const sahisSchema = Joi.object().keys({
    tckn: Joi.string().length(11).pattern(/^\d+$/).required(),
    ad_soyad: Joi.string().required(),
    vkn: Joi.any().strip(),
    unvan: Joi.any().strip(),
    vergi_dairesi: Joi.any().strip()
})

const kaydet = {
    body: Joi.object().keys({
        evrak_tarihi: Joi.any().strip(),
        temsilci: Joi.string().required(),
        olusturan: Joi.string().allow('', null),
        depo: Joi.number().integer().required(),
        fatura_tip: Joi.string().valid('firma', 'sahis').required(),
        fatura: Joi.when('fatura_tip', {
            is: 'firma',
            then: firmaSchema.required(),
            otherwise: sahisSchema.required()
        }),
        iletisim: Joi.object().keys({
            ad_soyad: Joi.string().required(),
            telefon: Joi.string().allow('', null),
            eposta: Joi.string().email().allow('', null)
        }).required(),
        stoklar: Joi.array().min(1).items(
            Joi.object().keys({
                stok: Joi.string().required(),
                miktar: Joi.number().positive().required(),
                birim_fiyat: Joi.number().min(0).required(),
                iskonto: Joi.number().min(0).default(0),
                aciklama: Joi.string().allow('', null).default('')
            })
        ).required(),
        notlar: Joi.array()
            .ordered(
                Joi.string().pattern(SERVIS_NO_PATTERN).required().messages({
                    'string.pattern.base': 'notlar[0] "#<servis_no> ..." formatında olmalıdır.'
                })
            )
            .items(Joi.string().allow(''))
            .required()
    })
}

module.exports = { kaydet, SERVIS_NO_PATTERN }