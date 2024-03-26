const { Satis } = require('../controllers')
const validate = require('../middlewares/validate')
const SatisValidation = require('../validations').Satis

const router = require('express').Router()

router
    .get('/', validate(SatisValidation.liste), Satis.liste)
    .get('/ozet', validate(SatisValidation.ozet), Satis.ozet)
    .get('/prim', validate(SatisValidation.prim), Satis.prim)

router.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = router;
