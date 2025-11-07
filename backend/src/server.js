/**
 * 三年级语文学习系统 - 后端服务器
 * 集成Notion数据库的Express API服务
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');

const config = require('./config/config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notionService = require('./services/notionService');

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
    origin: config.cors.origin,
    credentials: true
}));

// 请求日志
app.use(morgan('combined'));

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session配置
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.env === 'production',
        httpOnly: true,
        maxAge: config.session.maxAge
    }
}));

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env
    });
});

// API路由
app.use('/api', routes);

// 404处理
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.port;

async function startServer() {
    try {
        // 测试Notion连接
        console.log('Testing Notion connection...');
        await notionService.testConnection();
        console.log('Notion connection successful!');

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║  三年级语文学习系统 - API Server                          ║
║  Environment: ${config.env.padEnd(44)}║
║  Port: ${PORT.toString().padEnd(51)}║
║  Time: ${new Date().toLocaleString().padEnd(51)}║
╚════════════════════════════════════════════════════════════╝
            `);
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`API endpoint: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// 启动
startServer();

module.exports = app;
