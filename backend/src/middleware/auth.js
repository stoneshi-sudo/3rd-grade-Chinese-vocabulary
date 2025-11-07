/**
 * 认证中间件
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * 验证JWT令牌
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        // 也检查session
        if (req.session && req.session.userId) {
            req.user = {
                userId: req.session.userId,
                username: req.session.username,
                role: req.session.role
            };
            return next();
        }

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Access token required'
        });
    }

    jwt.verify(token, config.jwt.secret, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Invalid or expired token'
            });
        }

        req.user = user;
        next();
    });
}

/**
 * 验证教师角色
 */
function requireTeacher(req, res, next) {
    if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Teacher access required'
        });
    }
    next();
}

/**
 * 可选认证 - 如果有token则验证,没有则继续
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, config.jwt.secret, (err, user) => {
        if (!err) {
            req.user = user;
        }
        next();
    });
}

module.exports = {
    authenticateToken,
    requireTeacher,
    optionalAuth
};
