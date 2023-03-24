const initPaginate = (req, res, next) => {

    const page = req?.query?.page || 1
    const limit = req?.query?.limit || 20

    console.log({
        location: 'initPagination',
        query: req.query,
        paginationOptions: { page : parseInt(page), limit: parseInt(limit) }
    })

    req.paginationOptions = { page : parseInt(page), limit: parseInt(limit) }
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
