const statusCodes = require('http-status-codes')
const { Satis, Prim} = require('../services')

const dayjs = require('dayjs')

const liste = async (req, res, next) => {
    const {firstDate, lastDate, kar} = req.query

    Satis.list({firstDate, lastDate, kar})
        .then( satislar => {
          res.status(statusCodes.OK).json({
              data: satislar.data
          })
        })
}


const ozet = async (req, res, next) => {
    const { yil, type } = req.query
    const temsilci = req.query?.temsilci?.split('-')

    Satis.ozet({yil: parseInt(yil), type, temsilci})
        .then( siparis => {
            res.status(statusCodes.OK).json({
                meta: {
                    pagination: {
                        ...req.paginationOptions,
                        total: siparis.count
                    }
                },
                data: siparis.data
            })
        }).catch( next )
}

const prim = async (req, res, next) => {
    // get request timeout
    const temsilci = req.query.temsilci
    req.setTimeout(25*1000);
    try {
        Prim.ozet(temsilci)
            .then( prim => {
                console.log(prim)
                res.status(statusCodes.OK).json({
                    data: prim
                })
            })
            .catch(next)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    liste,
    ozet,
    prim
}
