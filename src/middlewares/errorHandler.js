const logger = require('../utils/logger')

module.exports = (err, req, res, next) => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';

    logger.error({
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })

    try {
        res.status(errStatus).json({
            success: false,
            status: errStatus,
            message: errMsg,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {}
        })
    } catch (e) {
        logger.error({
            status: 500,
            message: e.message,
            stack: process.env.NODE_ENV === 'development' ? e.stack : {}
        })
        res.json({
            status: 500,
            message: 'response status code sonradan atanamaz'
        })
    }
}
