/**
 * 近义词相关路由
 */

const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/synonyms
 * 获取所有近义词
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const synonyms = await notionService.synonyms.getAll();

        res.json({
            count: synonyms.length,
            data: synonyms
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
