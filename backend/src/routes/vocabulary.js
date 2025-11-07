/**
 * 词语相关路由
 */

const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/vocabulary
 * 获取所有词语或按课程筛选
 * Query参数: lesson (可选)
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { lesson } = req.query;
        const vocabulary = await notionService.vocabulary.getAll(lesson);

        res.json({
            count: vocabulary.length,
            lesson: lesson || 'all',
            data: vocabulary
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/vocabulary/:id
 * 获取单个词语
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const word = await notionService.vocabulary.getById(id);

        if (!word) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Vocabulary item not found'
            });
        }

        res.json(word);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/vocabulary/lessons/list
 * 获取所有课程列表及其词语数量
 */
router.get('/lessons/list', async (req, res, next) => {
    try {
        const allVocabulary = await notionService.vocabulary.getAll();

        // 统计每个课程的词语数量
        const lessonCounts = {};
        allVocabulary.forEach(item => {
            const lesson = item.lesson || 'other';
            lessonCounts[lesson] = (lessonCounts[lesson] || 0) + 1;
        });

        res.json({
            total: allVocabulary.length,
            lessons: lessonCounts
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
