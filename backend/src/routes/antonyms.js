/**
 * 反义词相关路由
 */

const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/antonyms
 * 获取所有反义词
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const antonyms = await notionService.antonyms.getAll();

        res.json({
            count: antonyms.length,
            data: antonyms
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
