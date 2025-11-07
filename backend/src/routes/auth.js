/**
 * 认证相关路由
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

const config = require('../config/config');
const notionService = require('../services/notionService');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register',
    [
        body('username').trim().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
        body('password').isLength({ min: 6 }),
        body('displayName').trim().isLength({ min: 1, max: 50 })
    ],
    async (req, res, next) => {
        try {
            // 验证输入
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password, displayName } = req.body;

            // 检查用户名是否已存在
            const existingUser = await notionService.users.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Username already exists'
                });
            }

            // 加密密码
            const passwordHash = await bcrypt.hash(password, 10);

            // 创建用户
            const userId = uuidv4();
            await notionService.users.create({
                username,
                displayName,
                userId,
                passwordHash,
                role: 'student'
            });

            res.status(201).json({
                message: 'User registered successfully',
                userId,
                username,
                displayName
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login',
    [
        body('username').trim().notEmpty(),
        body('password').notEmpty()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password } = req.body;

            // 查找用户
            const user = await notionService.users.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid credentials'
                });
            }

            // 验证密码
            const isValidPassword = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid credentials'
                });
            }

            // 更新最后登录时间
            await notionService.users.updateLastLogin(user.notionId);

            // 生成JWT
            const token = jwt.sign(
                {
                    userId: user.userId,
                    username: user.username,
                    role: user.role
                },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            // 设置session
            req.session.userId = user.userId;
            req.session.username = user.username;
            req.session.role = user.role;

            res.json({
                message: 'Login successful',
                token,
                user: {
                    userId: user.userId,
                    username: user.username,
                    displayName: user.displayName,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/logout', authenticateToken, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({
                error: 'Logout failed',
                message: err.message
            });
        }

        res.json({ message: 'Logout successful' });
    });
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authenticateToken, async (req, res, next) => {
    try {
        const user = await notionService.users.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        res.json({
            userId: user.userId,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            totalTime: user.totalTime,
            totalDays: user.totalDays,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
