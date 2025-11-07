/**
 * 学习记录相关路由
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

const notionService = require('../services/notionService');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/learning/records
 * 获取用户的学习记录
 * Query参数: itemType (可选)
 */
router.get('/records', authenticateToken, async (req, res, next) => {
    try {
        const { itemType } = req.query;
        const records = await notionService.learningRecords.getUserRecords(
            req.user.userId,
            itemType
        );

        res.json({
            count: records.length,
            itemType: itemType || 'all',
            data: records
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/learning/records
 * 创建学习记录
 */
router.post('/records',
    authenticateToken,
    [
        body('learningType').isIn(['vocabulary', 'dictation', 'polyphone', 'synonym', 'antonym']),
        body('itemId').isInt(),
        body('itemType').isIn(['vocabulary', 'polyphone', 'synonym', 'antonym']),
        body('mastered').isBoolean()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { learningType, itemId, itemType, mastered, lesson } = req.body;

            const recordId = uuidv4();
            await notionService.learningRecords.create({
                recordId,
                userId: req.user.userId,
                learningType,
                itemId,
                itemType,
                mastered,
                lesson
            });

            res.status(201).json({
                message: 'Learning record created',
                recordId
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/learning/sessions
 * 获取用户的练习会话历史
 */
router.get('/sessions', authenticateToken, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const sessions = await notionService.practiceSessions.getUserSessions(
            req.user.userId,
            limit
        );

        res.json({
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/learning/sessions
 * 创建练习会话记录
 */
router.post('/sessions',
    authenticateToken,
    [
        body('learningType').isIn(['vocabulary', 'dictation', 'polyphone', 'synonym', 'antonym']),
        body('startTime').isISO8601(),
        body('endTime').isISO8601(),
        body('totalQuestions').isInt({ min: 1 }),
        body('correctCount').isInt({ min: 0 }),
        body('wrongCount').isInt({ min: 0 })
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                learningType,
                lesson,
                startTime,
                endTime,
                totalQuestions,
                correctCount,
                wrongCount
            } = req.body;

            // 计算用时和正确率
            const start = new Date(startTime);
            const end = new Date(endTime);
            const duration = Math.floor((end - start) / 1000); // 秒
            const accuracy = Math.round((correctCount / totalQuestions) * 100);

            const sessionId = uuidv4();
            await notionService.practiceSessions.create({
                sessionId,
                userId: req.user.userId,
                learningType,
                lesson,
                startTime,
                endTime,
                duration,
                totalQuestions,
                correctCount,
                wrongCount,
                accuracy
            });

            res.status(201).json({
                message: 'Practice session created',
                sessionId,
                duration,
                accuracy
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/learning/mastered
 * 获取用户已掌握的项目ID列表
 * Query参数: itemType (可选)
 */
router.get('/mastered', authenticateToken, async (req, res, next) => {
    try {
        const { itemType } = req.query;
        const records = await notionService.learningRecords.getUserRecords(
            req.user.userId,
            itemType
        );

        // 提取已掌握的项目ID
        const masteredIds = records
            .filter(record => record.mastered)
            .map(record => ({
                itemId: record.itemId,
                itemType: record.itemType,
                learningType: record.learningType
            }));

        res.json({
            count: masteredIds.length,
            data: masteredIds
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
