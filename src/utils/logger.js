const { createLogger, transports, format } = require("winston");

const logger = createLogger({
    transports: [
        new transports.File({ filename: 'src/logs/info.log', level: 'info' }),
        new transports.File({ filename: 'src/logs/error.log', level: 'error' }),
        new transports.File({ filename: 'src/logs/debug.log', level: 'debug' })
    ],
    format: format.combine(
        format.timestamp(),
        format.json()
    )
})

module.exports = logger
