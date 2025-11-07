/**
 * 应用配置
 */

module.exports = {
    // 环境
    env: process.env.NODE_ENV || 'development',

    // 服务器端口
    port: parseInt(process.env.PORT, 10) || 3000,

    // Notion配置
    notion: {
        apiKey: process.env.NOTION_API_KEY,
        databases: {
            vocabulary: process.env.NOTION_DATABASE_VOCABULARY,
            polyphones: process.env.NOTION_DATABASE_POLYPHONES,
            synonyms: process.env.NOTION_DATABASE_SYNONYMS,
            antonyms: process.env.NOTION_DATABASE_ANTONYMS,
            users: process.env.NOTION_DATABASE_USERS,
            learningRecords: process.env.NOTION_DATABASE_LEARNING_RECORDS,
            practiceSessions: process.env.NOTION_DATABASE_PRACTICE_SESSIONS
        },
        rateLimitDelay: parseInt(process.env.NOTION_RATE_LIMIT_DELAY, 10) || 350
    },

    // JWT配置
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    // Session配置
    session: {
        secret: process.env.SESSION_SECRET || 'default-session-secret',
        maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 604800000 // 7天
    },

    // CORS配置
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:8080'
    },

    // 缓存配置
    cache: {
        ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5分钟
        checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD, 10) || 600 // 10分钟
    }
};
