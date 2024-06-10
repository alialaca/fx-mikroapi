const Prisma = require('../services/prisma')
const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

class MuhasebeFisModel {
    constructor() {
        this.db = Prisma()
    }

    list({filter, pagination}) {
        const {page, limit} = pagination

        const query = {}

        if (filter) query.where = filter
        if (page && limit) {
            query.skip = (page - 1) * limit
            query.take = limit
        }

        return this.db['muhasebeFis'].findMany(query)
    }

    async lastItem(serino, maliyil) {
        return this.db['siparisOzet'].findFirst({
            where: {
                evrak_seri: serino,
                fis_maliyil: maliyil
            },
            orderBy: {
                evrak_sira: 'desc'
            }
        })
    }

    create(data) {
        return this.db['muhasebeFis'].create({
            data
        })
    }

    remove(id) {
        return this.db['muhasebeFis'].delete({
            where: {
                id
            }
        })
    }
}

module.exports = new MuhasebeFisModel()