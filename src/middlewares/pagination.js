const initPaginate = (req, res, next) => {

    const page = req?.query?.page || 1
    const limit = req?.query?.limit || 20
    const search = req?.query.search || ''

    req.paginationOptions = { page : parseInt(page), limit: parseInt(limit), search }
    next()
}

const endPaginate = ( req, res ) => {
    res.status = 210
    res.json({
        pageOptions: req.paginationOptions,
        data: res.data,
        status: res.status
    })
}


module.exports = {
    initPaginate,
    endPaginate
}
