const {Tahsilat} = require('../models');
const dayjs = require("dayjs");

const list = async function({cari, temsilci, firstDate, lastDate}, {page, limit}) {

    const lastItem = await Tahsilat.lastItem()

    const params = {
        cari,
        temsilci,
        firstDate: dayjs(firstDate).add(3, 'hour').toISOString(),
        lastDate: dayjs(lastDate).add(3, 'hour').toISOString(),
    }

    const data = await Tahsilat.list({...params}, {page, limit})
    const count = await Tahsilat.listCount({...params})
    return Promise.resolve({data, count})
}

const lastItem = async function() {
    return Tahsilat.lastItem()
}

const create = async function(data) {
    return Tahsilat.create(data)
}

const remove = async function(id) {
    return Tahsilat.remove(id)
}

module.exports = {
    list,
    create,
    lastItem,
    remove
}