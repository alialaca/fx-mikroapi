const {MuhasebeFis} = require('../models');

const list = async function({page, limit}) {

    return MuhasebeFis.list({pagination: {page, limit}})
}

const lastItem = async function() {
    return MuhasebeFis.lastItem("", 2024)
}

const create = async function(data) {
    return MuhasebeFis.create(data)
}

const remove = async function(id) {
    return MuhasebeFis.remove(id)
}

module.exports = {
    list,
    create,
    lastItem,
    remove
}