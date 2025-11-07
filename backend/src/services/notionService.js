/**
 * Notion API服务
 * 处理所有与Notion数据库的交互
 */

const { Client } = require('@notionhq/client');
const config = require('../config/config');
const NodeCache = require('node-cache');

// 初始化Notion客户端
const notion = new Client({
    auth: config.notion.apiKey
});

// 初始化缓存
const cache = new NodeCache({
    stdTTL: config.cache.ttl,
    checkperiod: config.cache.checkPeriod
});

/**
 * 速率限制工具 - Notion API限制为每秒3个请求
 */
let lastRequestTime = 0;
const rateLimitDelay = config.notion.rateLimitDelay;

async function rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < rateLimitDelay) {
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay - timeSinceLastRequest));
    }

    lastRequestTime = Date.now();
}

/**
 * 测试Notion连接
 */
async function testConnection() {
    try {
        await rateLimit();
        const response = await notion.databases.retrieve({
            database_id: config.notion.databases.vocabulary
        });
        return { success: true, title: response.title };
    } catch (error) {
        console.error('Notion connection test failed:', error);
        throw new Error('Failed to connect to Notion API');
    }
}

/**
 * 通用查询方法
 */
async function queryDatabase(databaseId, filter = {}, sorts = []) {
    const cacheKey = `query_${databaseId}_${JSON.stringify(filter)}_${JSON.stringify(sorts)}`;
    const cached = cache.get(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        await rateLimit();
        const response = await notion.databases.query({
            database_id: databaseId,
            filter,
            sorts
        });

        cache.set(cacheKey, response.results);
        return response.results;
    } catch (error) {
        console.error('Query database error:', error);
        throw error;
    }
}

/**
 * 创建页面
 */
async function createPage(databaseId, properties) {
    try {
        await rateLimit();
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties
        });

        // 清除相关缓存
        cache.flushAll();

        return response;
    } catch (error) {
        console.error('Create page error:', error);
        throw error;
    }
}

/**
 * 更新页面
 */
async function updatePage(pageId, properties) {
    try {
        await rateLimit();
        const response = await notion.pages.update({
            page_id: pageId,
            properties
        });

        // 清除相关缓存
        cache.flushAll();

        return response;
    } catch (error) {
        console.error('Update page error:', error);
        throw error;
    }
}

/**
 * 词语相关方法
 */
const vocabulary = {
    async getAll(lesson = null) {
        const filter = lesson ? {
            property: '课程',
            select: {
                equals: lesson
            }
        } : undefined;

        const results = await queryDatabase(
            config.notion.databases.vocabulary,
            filter,
            [{ property: '词语ID', direction: 'ascending' }]
        );

        return results.map(parseVocabularyPage);
    },

    async getById(id) {
        const filter = {
            property: '词语ID',
            number: {
                equals: parseInt(id)
            }
        };

        const results = await queryDatabase(
            config.notion.databases.vocabulary,
            filter
        );

        return results.length > 0 ? parseVocabularyPage(results[0]) : null;
    },

    async create(data) {
        const properties = {
            '词语': { title: [{ text: { content: data.word } }] },
            '拼音': { rich_text: [{ text: { content: data.pinyin } }] },
            '释义': { rich_text: [{ text: { content: data.meaning } }] },
            '课程': { select: { name: data.lesson } },
            '词语ID': { number: data.id }
        };

        if (data.isNew) {
            properties['是否新增'] = { checkbox: true };
        }

        if (data.courseName) {
            properties['课程名称'] = { rich_text: [{ text: { content: data.courseName } }] };
        }

        return await createPage(config.notion.databases.vocabulary, properties);
    }
};

/**
 * 多音字相关方法
 */
const polyphones = {
    async getAll() {
        const results = await queryDatabase(
            config.notion.databases.polyphones,
            undefined,
            [{ property: '多音字ID', direction: 'ascending' }]
        );

        return results.map(parsePolyphonePage);
    },

    async create(data) {
        const properties = {
            '汉字': { title: [{ text: { content: data.char } }] },
            '读音1': { rich_text: [{ text: { content: data.options[0].pinyin } }] },
            '读音1释义': { rich_text: [{ text: { content: data.options[0].meaning } }] },
            '读音1例词': { rich_text: [{ text: { content: data.options[0].example } }] },
            '多音字ID': { number: data.id }
        };

        if (data.options[1]) {
            properties['读音2'] = { rich_text: [{ text: { content: data.options[1].pinyin } }] };
            properties['读音2释义'] = { rich_text: [{ text: { content: data.options[1].meaning } }] };
            properties['读音2例词'] = { rich_text: [{ text: { content: data.options[1].example } }] };
        }

        if (data.options[2]) {
            properties['读音3'] = { rich_text: [{ text: { content: data.options[2].pinyin } }] };
            properties['读音3释义'] = { rich_text: [{ text: { content: data.options[2].meaning } }] };
            properties['读音3例词'] = { rich_text: [{ text: { content: data.options[2].example } }] };
        }

        if (data.isNew) {
            properties['是否新增'] = { checkbox: true };
        }

        return await createPage(config.notion.databases.polyphones, properties);
    }
};

/**
 * 近义词相关方法
 */
const synonyms = {
    async getAll() {
        const results = await queryDatabase(
            config.notion.databases.synonyms,
            undefined,
            [{ property: '近义词ID', direction: 'ascending' }]
        );

        return results.map(parseSynonymPage);
    },

    async create(data) {
        const properties = {
            '词语1': { title: [{ text: { content: data.word1 } }] },
            '词语2': { rich_text: [{ text: { content: data.word2 } }] },
            '近义词ID': { number: data.id }
        };

        if (data.isNew) {
            properties['是否新增'] = { checkbox: true };
        }

        if (data.source) {
            properties['来源'] = { rich_text: [{ text: { content: data.source } }] };
        }

        return await createPage(config.notion.databases.synonyms, properties);
    }
};

/**
 * 反义词相关方法
 */
const antonyms = {
    async getAll() {
        const results = await queryDatabase(
            config.notion.databases.antonyms,
            undefined,
            [{ property: '反义词ID', direction: 'ascending' }]
        );

        return results.map(parseAntonymPage);
    },

    async create(data) {
        const properties = {
            '词语1': { title: [{ text: { content: data.word1 } }] },
            '词语2': { rich_text: [{ text: { content: data.word2 } }] },
            '反义词ID': { number: data.id }
        };

        return await createPage(config.notion.databases.antonyms, properties);
    }
};

/**
 * 用户相关方法
 */
const users = {
    async findByUsername(username) {
        const filter = {
            property: '用户名',
            title: {
                equals: username
            }
        };

        const results = await queryDatabase(config.notion.databases.users, filter);
        return results.length > 0 ? parseUserPage(results[0]) : null;
    },

    async findById(userId) {
        const filter = {
            property: '用户ID',
            rich_text: {
                equals: userId
            }
        };

        const results = await queryDatabase(config.notion.databases.users, filter);
        return results.length > 0 ? parseUserPage(results[0]) : null;
    },

    async create(data) {
        const properties = {
            '用户名': { title: [{ text: { content: data.username } }] },
            '显示名称': { rich_text: [{ text: { content: data.displayName } }] },
            '用户ID': { rich_text: [{ text: { content: data.userId } }] },
            '密码哈希': { rich_text: [{ text: { content: data.passwordHash } }] },
            '角色': { select: { name: data.role || 'student' } },
            '总学习时长': { number: 0 },
            '学习天数': { number: 0 }
        };

        return await createPage(config.notion.databases.users, properties);
    },

    async updateLastLogin(pageId) {
        const properties = {
            '最后登录': { date: { start: new Date().toISOString() } }
        };

        return await updatePage(pageId, properties);
    },

    async updateStats(pageId, totalTime, totalDays) {
        const properties = {
            '总学习时长': { number: totalTime },
            '学习天数': { number: totalDays }
        };

        return await updatePage(pageId, properties);
    }
};

/**
 * 学习记录相关方法
 */
const learningRecords = {
    async getUserRecords(userId, itemType = null) {
        // 注意：Notion的relation查询需要特殊处理
        const filter = itemType ? {
            and: [
                {
                    property: '项目类型',
                    select: {
                        equals: itemType
                    }
                }
            ]
        } : undefined;

        const results = await queryDatabase(
            config.notion.databases.learningRecords,
            filter,
            [{ property: '学习时间', direction: 'descending' }]
        );

        // 过滤用户记录（因为Notion relation查询限制）
        return results
            .map(parseLearningRecordPage)
            .filter(record => record.userId === userId);
    },

    async create(data) {
        const properties = {
            '记录ID': { title: [{ text: { content: data.recordId } }] },
            '学习类型': { select: { name: data.learningType } },
            '项目ID': { number: data.itemId },
            '项目类型': { select: { name: data.itemType } },
            '是否掌握': { checkbox: data.mastered },
            '学习时间': { date: { start: new Date().toISOString() } }
        };

        if (data.lesson) {
            properties['课程'] = { select: { name: data.lesson } };
        }

        // 注意：Notion relation需要页面ID，这里需要先查找用户页面ID
        // 暂时简化处理，可以在后续优化

        return await createPage(config.notion.databases.learningRecords, properties);
    }
};

/**
 * 练习会话相关方法
 */
const practiceSessions = {
    async getUserSessions(userId, limit = 10) {
        const results = await queryDatabase(
            config.notion.databases.practiceSessions,
            undefined,
            [{ property: '开始时间', direction: 'descending' }]
        );

        // 过滤用户会话并限制数量
        return results
            .map(parsePracticeSessionPage)
            .filter(session => session.userId === userId)
            .slice(0, limit);
    },

    async create(data) {
        const properties = {
            '会话ID': { title: [{ text: { content: data.sessionId } }] },
            '学习类型': { select: { name: data.learningType } },
            '开始时间': { date: { start: data.startTime } },
            '结束时间': { date: { start: data.endTime } },
            '用时': { number: data.duration },
            '总题数': { number: data.totalQuestions },
            '正确数': { number: data.correctCount },
            '错误数': { number: data.wrongCount },
            '正确率': { number: data.accuracy }
        };

        if (data.lesson) {
            properties['课程'] = { select: { name: data.lesson } };
        }

        return await createPage(config.notion.databases.practiceSessions, properties);
    }
};

/**
 * 解析方法 - 将Notion页面转换为应用数据格式
 */
function parseVocabularyPage(page) {
    return {
        id: page.properties['词语ID']?.number || 0,
        word: page.properties['词语']?.title[0]?.text?.content || '',
        pinyin: page.properties['拼音']?.rich_text[0]?.text?.content || '',
        meaning: page.properties['释义']?.rich_text[0]?.text?.content || '',
        lesson: page.properties['课程']?.select?.name || 'other',
        courseName: page.properties['课程名称']?.rich_text[0]?.text?.content || '',
        isNew: page.properties['是否新增']?.checkbox || false,
        notionId: page.id
    };
}

function parsePolyphonePage(page) {
    const options = [
        {
            pinyin: page.properties['读音1']?.rich_text[0]?.text?.content || '',
            meaning: page.properties['读音1释义']?.rich_text[0]?.text?.content || '',
            example: page.properties['读音1例词']?.rich_text[0]?.text?.content || ''
        }
    ];

    if (page.properties['读音2']?.rich_text[0]) {
        options.push({
            pinyin: page.properties['读音2']?.rich_text[0]?.text?.content || '',
            meaning: page.properties['读音2释义']?.rich_text[0]?.text?.content || '',
            example: page.properties['读音2例词']?.rich_text[0]?.text?.content || ''
        });
    }

    if (page.properties['读音3']?.rich_text[0]) {
        options.push({
            pinyin: page.properties['读音3']?.rich_text[0]?.text?.content || '',
            meaning: page.properties['读音3释义']?.rich_text[0]?.text?.content || '',
            example: page.properties['读音3例词']?.rich_text[0]?.text?.content || ''
        });
    }

    return {
        id: page.properties['多音字ID']?.number || 0,
        char: page.properties['汉字']?.title[0]?.text?.content || '',
        options,
        isNew: page.properties['是否新增']?.checkbox || false,
        notionId: page.id
    };
}

function parseSynonymPage(page) {
    return {
        id: page.properties['近义词ID']?.number || 0,
        word1: page.properties['词语1']?.title[0]?.text?.content || '',
        word2: page.properties['词语2']?.rich_text[0]?.text?.content || '',
        isNew: page.properties['是否新增']?.checkbox || false,
        source: page.properties['来源']?.rich_text[0]?.text?.content || '',
        notionId: page.id
    };
}

function parseAntonymPage(page) {
    return {
        id: page.properties['反义词ID']?.number || 0,
        word1: page.properties['词语1']?.title[0]?.text?.content || '',
        word2: page.properties['词语2']?.rich_text[0]?.text?.content || '',
        notionId: page.id
    };
}

function parseUserPage(page) {
    return {
        username: page.properties['用户名']?.title[0]?.text?.content || '',
        displayName: page.properties['显示名称']?.rich_text[0]?.text?.content || '',
        userId: page.properties['用户ID']?.rich_text[0]?.text?.content || '',
        passwordHash: page.properties['密码哈希']?.rich_text[0]?.text?.content || '',
        role: page.properties['角色']?.select?.name || 'student',
        totalTime: page.properties['总学习时长']?.number || 0,
        totalDays: page.properties['学习天数']?.number || 0,
        lastLogin: page.properties['最后登录']?.date?.start || null,
        notionId: page.id
    };
}

function parseLearningRecordPage(page) {
    return {
        recordId: page.properties['记录ID']?.title[0]?.text?.content || '',
        learningType: page.properties['学习类型']?.select?.name || '',
        itemId: page.properties['项目ID']?.number || 0,
        itemType: page.properties['项目类型']?.select?.name || '',
        mastered: page.properties['是否掌握']?.checkbox || false,
        lesson: page.properties['课程']?.select?.name || null,
        learningTime: page.properties['学习时间']?.date?.start || null,
        notionId: page.id
    };
}

function parsePracticeSessionPage(page) {
    return {
        sessionId: page.properties['会话ID']?.title[0]?.text?.content || '',
        learningType: page.properties['学习类型']?.select?.name || '',
        lesson: page.properties['课程']?.select?.name || null,
        startTime: page.properties['开始时间']?.date?.start || null,
        endTime: page.properties['结束时间']?.date?.start || null,
        duration: page.properties['用时']?.number || 0,
        totalQuestions: page.properties['总题数']?.number || 0,
        correctCount: page.properties['正确数']?.number || 0,
        wrongCount: page.properties['错误数']?.number || 0,
        accuracy: page.properties['正确率']?.number || 0,
        notionId: page.id
    };
}

module.exports = {
    testConnection,
    vocabulary,
    polyphones,
    synonyms,
    antonyms,
    users,
    learningRecords,
    practiceSessions,
    cache
};
