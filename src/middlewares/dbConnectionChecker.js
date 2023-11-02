const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const checkPrismaContection = async () => {
    try {
        await prisma.$connect()
    } catch (e) {
        throw new Error('Database connection error')
    }
}

const connectionChecker = async (req, res, next) => {
    console.log(':: connectionChecker')
    try {
        await checkPrismaContection()
        next()
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports = connectionChecker
