/**
 * 全局错误处理中间件
 */

function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Notion API错误
    if (err.code && err.code.startsWith('notion_')) {
        return res.status(500).json({
            error: 'Database Error',
            message: 'Failed to access database',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // 验证错误
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message,
            errors: err.errors
        });
    }

    // 认证错误
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing authentication'
        });
    }

    // 默认服务器错误
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

module.exports = errorHandler;
