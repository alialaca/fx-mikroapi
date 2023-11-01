const statusCodes = require('http-status-codes')
const { Stok } = require('../services')
const list = async (req, res, next) => {

    let fields = req.query.project
    let search = req.query.search

    if (typeof fields === 'string') fields = [req.query.project]

    Stok.list({fields, search, ...req.paginationOptions})
        .then(({count, data}) => {
            res.status(statusCodes.OK).json({
                meta: {
                    pagination: {
                        ...req.paginationOptions,
                        total: count
                    }
                },
                data: data
            })
        })
        .catch(next)
}

const find = async (req, res) => {
    const kod = req.params.kod
    const temsilci= req.query?.temsilci?.split('-')

    let fields = req.query.project

    if (typeof fields === 'string') fields = [req.query.project]

    Stok.find(kod, {fields, temsilci})
        .then( stok => {
            res.status(200).json({
                data:stok
            })
        })
        .catch(error => {
            res.status(500).json({
                error: error.message
            })
        })
}

module.exports = {
    list,
    find
}
