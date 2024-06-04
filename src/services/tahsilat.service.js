const {Tahsilat} = require('../models');
const dayjs = require("dayjs");

const list = async function({cari, temsilci, firstDate, lastDate}, {page, limit}) {
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

module.exports = {
    list
}