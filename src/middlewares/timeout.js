const ApiError = require("../utils/ApiError");
const httpStatus = require('http-status');
module.exports = (req, res, next) => {
    const apiTimeout = 25 * 1000;
    req.setTimeout(apiTimeout, () => {
        next(new ApiError(httpStatus.REQUEST_TIMEOUT, 'İstek zaman aşımına uğradı'));
    });
    res.setTimeout(apiTimeout, () => {
        next(new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Servis yanıt vermedi'));
    });
    next();
}
