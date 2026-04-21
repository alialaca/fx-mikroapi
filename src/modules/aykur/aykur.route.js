const Aykur = require('./aykur.controller')
const Validation = require('./aykur.validation')
const {validate} = require('../../middlewares')

const router = require('express').Router()

router
    .get('/', Aykur.list)
    .post('/', validate(Validation.create), Aykur.create)
    .patch('/:id', validate(Validation.update), Aykur.update)
    .delete('/:id', validate(Validation.remove), Aykur.remove)

module.exports = router;
