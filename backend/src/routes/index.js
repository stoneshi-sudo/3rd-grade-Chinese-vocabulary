/**
 * API路由主入口
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const vocabularyRoutes = require('./vocabulary');
const polyphonesRoutes = require('./polyphones');
const synonymsRoutes = require('./synonyms');
const antonymsRoutes = require('./antonyms');
const learningRoutes = require('./learning');
const statsRoutes = require('./stats');

// API版本信息
router.get('/', (req, res) => {
    res.json({
        name: '三年级语文学习系统 API',
        version: '1.0.0',
        description: 'Backend API with Notion integration',
        endpoints: {
            auth: '/api/auth',
            vocabulary: '/api/vocabulary',
            polyphones: '/api/polyphones',
            synonyms: '/api/synonyms',
            antonyms: '/api/antonyms',
            learning: '/api/learning',
            stats: '/api/stats'
        }
    });
});

// 挂载子路由
router.use('/auth', authRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/polyphones', polyphonesRoutes);
router.use('/synonyms', synonymsRoutes);
router.use('/antonyms', antonymsRoutes);
router.use('/learning', learningRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
