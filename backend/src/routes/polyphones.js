/**
 * 多音字相关路由
 */

const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/polyphones
 * 获取所有多音字
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const polyphones = await notionService.polyphones.getAll();

        res.json({
            count: polyphones.length,
            data: polyphones
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
