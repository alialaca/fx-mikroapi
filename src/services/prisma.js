const { PrismaClient } = require( '@prisma/client' )

let urlString = process.env.DATABASE_URL || ''
let position = urlString.indexOf('\\')

if (position < 0) {
    let serverName = urlString?.split("://")[1]?.split(";")[0]
    let newServerName = serverName.replace("/", "\\")

    process.env.DATABASE_URL = urlString.split(serverName).join(newServerName)
}

module.exports = () => {
    return new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : []
    })
}
