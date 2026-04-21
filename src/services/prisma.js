const { PrismaClient } = require('@prisma/client');

const normalizeDbUrl = (raw = '') => {
    if (raw.indexOf('\\') >= 0) return raw;
    const serverName = raw.split('://')[1]?.split(';')[0];
    if (!serverName) return raw;
    return raw.split(serverName).join(serverName.replace('/', '\\'));
};

const url = normalizeDbUrl(process.env.DATABASE_URL);

const prisma = globalThis.__mikroapi_prisma ?? new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
});

if (process.env.NODE_ENV !== 'production') {
    globalThis.__mikroapi_prisma = prisma;
}

module.exports = prisma;
