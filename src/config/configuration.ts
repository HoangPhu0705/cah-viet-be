export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  feUrl: process.env.FE_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    guestExpiresIn: process.env.GUEST_JWT_EXPIRES_IN || '24h',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
});
