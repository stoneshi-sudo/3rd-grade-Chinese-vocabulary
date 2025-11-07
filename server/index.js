require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const NotionService = require('./notionService');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 初始化 Notion 服务
const notionService = new NotionService();

// API 路由

/**
 * GET /api/words - 获取生词列表
 */
app.get('/api/words', async (req, res) => {
    try {
        const words = await notionService.getVocabularyWords();
        res.json({
            success: true,
            count: words.length,
            words: words
        });
    } catch (error) {
        console.error('Error in /api/words:', error);
        res.status(500).json({
            success: false,
            error: '获取生词失败',
            message: error.message
        });
    }
});

/**
 * POST /api/records - 保存学习记录
 */
app.post('/api/records', async (req, res) => {
    try {
        const record = req.body;

        // 验证必需字段
        if (!record.word) {
            return res.status(400).json({
                success: false,
                error: '缺少必需字段: word'
            });
        }

        const result = await notionService.saveStudyRecord(record);

        res.json({
            success: true,
            message: '学习记录已保存',
            id: result.id
        });
    } catch (error) {
        console.error('Error in /api/records:', error);
        res.status(500).json({
            success: false,
            error: '保存学习记录失败',
            message: error.message
        });
    }
});

/**
 * GET /api/statistics - 获取统计信息
 */
app.get('/api/statistics', async (req, res) => {
    try {
        const stats = await notionService.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error in /api/statistics:', error);
        res.status(500).json({
            success: false,
            error: '获取统计信息失败',
            message: error.message
        });
    }
});

/**
 * GET /api/health - 健康检查
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务运行正常',
        version: '5.2.0',
        timestamp: new Date().toISOString()
    });
});

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: '服务器内部错误',
        message: err.message
    });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '请求的资源不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     📚 三年级语文完整学习系统 v5.2                          ║
║                                                            ║
║     服务器运行在: http://localhost:${PORT}                   ║
║     API 文档: http://localhost:${PORT}/api/health           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);

    // 检查环境变量
    if (!process.env.NOTION_API_KEY) {
        console.warn('⚠️  警告: 未设置 NOTION_API_KEY 环境变量');
    }
    if (!process.env.NOTION_DATABASE_ID) {
        console.warn('⚠️  警告: 未设置 NOTION_DATABASE_ID 环境变量');
    }
});

module.exports = app;
