require('dotenv').config();

const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];

const missingVars = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missingVars.length) {
    console.warn(
        `⚠️  Missing required environment variables: ${missingVars.join(', ')}. The server may not behave as expected.`
    );
}

const parseList = (value) =>
    value
        ? value
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [];

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
    nodeEnv,
    isProd: nodeEnv === 'production',
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    exposeDebugRoutes: process.env.EXPOSE_DEBUG_ROUTES === 'true',
    allowedOrigins: parseList(process.env.CORS_ORIGINS),
};
