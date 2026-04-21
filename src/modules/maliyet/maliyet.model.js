const prisma = require('../../services/prisma')

class MaliyetModel {
    constructor() {
        this.db = prisma
    }

    list() {
        return this.db['stok'].findMany({
            select: {
                kod: true,
                isim: true,
                maliyet: true
            }
        })
    }

    create(data) {
        return this.db['sabitMaliyet'].create({data})
    }

    update({id, kod, baslangic_tarihi, maliyet}) {
        return this.db['sabitMaliyet'].update({
            where: {id},
            data: {kod, baslangic_tarihi, maliyet}
        })
    }

    remove(id) {
        return this.db['sabitMaliyet'].delete({where: {id}})
    }
}

module.exports = new MaliyetModel()
