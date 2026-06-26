// Runtime Prisma config (CommonJS) so the Prisma CLI can read connection URL
const { defineConfig } = require('prisma/config');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
