/**
 * 统计数据相关路由
 */

const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/stats/overview
 * 获取用户学习概览统计
 */
router.get('/overview', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // 获取用户信息
        const user = await notionService.users.findById(userId);

        // 获取所有学习记录
        const records = await notionService.learningRecords.getUserRecords(userId);

        // 统计各类型掌握数量
        const stats = {
            totalLearned: 0,
            totalItems: 282, // 总项目数(146词语 + 32多音字 + 62近义词 + 42反义词)
            vocabularyLearned: 0,
            vocabularyTotal: 146,
            polyphoneLearned: 0,
            polyphoneTotal: 32,
            synonymLearned: 0,
            synonymTotal: 62,
            antonymLearned: 0,
            antonymTotal: 42,
            totalTime: user?.totalTime || 0,
            totalDays: user?.totalDays || 0
        };

        // 统计掌握数量
        const masteredItems = new Set();
        records.forEach(record => {
            if (record.mastered) {
                const key = `${record.itemType}-${record.itemId}`;
                masteredItems.add(key);

                switch (record.itemType) {
                    case 'vocabulary':
                        stats.vocabularyLearned++;
                        break;
                    case 'polyphone':
                        stats.polyphoneLearned++;
                        break;
                    case 'synonym':
                        stats.synonymLearned++;
                        break;
                    case 'antonym':
                        stats.antonymLearned++;
                        break;
                }
            }
        });

        stats.totalLearned = masteredItems.size;

        // 计算进度百分比
        stats.progress = Math.round((stats.totalLearned / stats.totalItems) * 100);

        res.json(stats);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/stats/progress
 * 获取学习进度详情(按课程)
 */
router.get('/progress', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const records = await notionService.learningRecords.getUserRecords(userId);

        // 按课程统计
        const lessonProgress = {};

        records.forEach(record => {
            if (record.lesson && record.mastered) {
                if (!lessonProgress[record.lesson]) {
                    lessonProgress[record.lesson] = {
                        total: 0,
                        mastered: 0
                    };
                }
                lessonProgress[record.lesson].mastered++;
            }
        });

        // 获取每个课程的总数
        const allVocabulary = await notionService.vocabulary.getAll();
        allVocabulary.forEach(item => {
            const lesson = item.lesson || 'other';
            if (!lessonProgress[lesson]) {
                lessonProgress[lesson] = { total: 0, mastered: 0 };
            }
            lessonProgress[lesson].total++;
        });

        // 计算每个课程的完成百分比
        Object.keys(lessonProgress).forEach(lesson => {
            const data = lessonProgress[lesson];
            data.percentage = data.total > 0
                ? Math.round((data.mastered / data.total) * 100)
                : 0;
        });

        res.json({
            lessons: lessonProgress
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/stats/recent-sessions
 * 获取最近的练习会话
 */
router.get('/recent-sessions', authenticateToken, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
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
 * GET /api/stats/weak-points
 * 获取薄弱环节(错误率高的项目)
 */
router.get('/weak-points', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const records = await notionService.learningRecords.getUserRecords(userId);

        // 统计每个项目的错误次数
        const itemStats = {};

        records.forEach(record => {
            const key = `${record.itemType}-${record.itemId}`;

            if (!itemStats[key]) {
                itemStats[key] = {
                    itemId: record.itemId,
                    itemType: record.itemType,
                    attempts: 0,
                    failures: 0
                };
            }

            itemStats[key].attempts++;
            if (!record.mastered) {
                itemStats[key].failures++;
            }
        });

        // 找出错误率高的项目(错误率 > 30% 且尝试次数 >= 2)
        const weakPoints = Object.values(itemStats)
            .filter(stat => stat.attempts >= 2 && (stat.failures / stat.attempts) > 0.3)
            .sort((a, b) => (b.failures / b.attempts) - (a.failures / a.attempts))
            .slice(0, 10);

        res.json({
            count: weakPoints.length,
            data: weakPoints
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
