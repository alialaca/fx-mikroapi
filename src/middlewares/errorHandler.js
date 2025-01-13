const logger = require('../utils/logger')

/**
 * Error handling middleware.
 *
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} req.auth - The authenticated user information.
 * @param {Object} res - The response object.
 * @param {Function} _ - The next middleware function.
 */
module.exports = (err, req, res, _) => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Sunucu yanıt vermiyor';
    const errorDetails = {
        user: req.auth,
        status: errStatus,
        message: errMsg,
        stack: err.stack
    };

    logger.error(errorDetails);

    res.status(errStatus).json({
        error: errMsg
    })
}