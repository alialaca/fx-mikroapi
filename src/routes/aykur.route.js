const {Aykur} = require('../controllers')
const {validate} = require('../middlewares')
const Validation = require('../validations').Aykur

const router = require('express').Router()

router
    .get('/', Aykur.list)
    .post('/', validate(Validation.create), Aykur.create)
    .patch('/:id', validate(Validation.update), Aykur.update)
    .delete('/:id', validate(Validation.remove), Aykur.remove)

module.exports = router;
