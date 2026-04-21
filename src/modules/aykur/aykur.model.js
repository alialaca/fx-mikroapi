const {PrismaClient} = require('@prisma/client')

class AykurModel {
    constructor() {
        this.db = new PrismaClient()
    }

    list() {
        return this.db['aykur'].findMany({orderBy: {baslangic_tarihi: 'desc'}})
    }

    create(data) {
        return this.db['aykur'].create({data})
    }

    update({id, baslangic_tarihi, kur}) {
        return this.db['aykur'].update({
            where: {id},
            data: {baslangic_tarihi, kur}
        })
    }

    remove(id) {
        return this.db['aykur'].delete({where: {id}})
    }
}

module.exports = new AykurModel()
