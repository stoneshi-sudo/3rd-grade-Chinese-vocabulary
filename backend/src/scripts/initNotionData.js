/**
 * Notion数据库初始化脚本
 * 将学习数据导入Notion数据库
 *
 * 使用方法: npm run init-data
 */

require('dotenv').config();
const notionService = require('../services/notionService');

// 课程列表
const lessons = {
    'lesson1': { name: '1.大青树下的小学', shortName: '大青树下的小学' },
    'lesson2': { name: '2.花的学校', shortName: '花的学校' },
    'lesson3': { name: '3.不懂就要问', shortName: '不懂就要问' },
    'lesson4': { name: '4.古诗三首', shortName: '古诗三首' },
    'lesson5': { name: '5.铺满金色巴掌的水泥道', shortName: '铺满金色巴掌' },
    'lesson6': { name: '6.秋天的雨', shortName: '秋天的雨' },
    'lesson7': { name: '7.听听,秋的声音', shortName: '听听秋的声音' },
    'lesson8': { name: '8.去年的树', shortName: '去年的树' },
    'lesson9': { name: '9.那一定会很好', shortName: '那一定会很好' },
    'lesson10': { name: '10.在牛肚子里旅行', shortName: '在牛肚子里旅行' },
    'lesson11': { name: '11.一块奶酪', shortName: '一块奶酪' },
    'lesson12': { name: '12.总也倒不了的老屋', shortName: '总也倒不了的老屋' },
    'lesson13': { name: '13.胡萝卜先生的长胡子', shortName: '胡萝卜先生的长胡子' },
    'lesson14': { name: '14.小狗学叫', shortName: '小狗学叫' },
    'lesson15': { name: '15.搭船的鸟', shortName: '搭船的鸟' },
    'lesson16': { name: '16.金色的草地', shortName: '金色的草地' },
    'other': { name: '其他课文', shortName: '其他' }
};

// 146个词语数据
const vocabularyList = [
    { id: 1, word: "变成", pinyin: "biàn chéng", meaning: "从一种形态变为另一种形态", lesson: "lesson9" },
    { id: 2, word: "门板", pinyin: "mén bǎn", meaning: "门上的木板", lesson: "lesson12" },
    { id: 3, word: "准备", pinyin: "zhǔn bèi", meaning: "预先安排或筹划", lesson: "lesson10" },
    // ... (完整的146个词语数据，这里省略，实际使用时应包含所有数据)
    { id: 146, word: "鸟太太", pinyin: "niǎo tài tai", meaning: "母鸟,雌性的鸟", lesson: "lesson13", isNew: true }
];

// 32个多音字数据
const polyphoneList = [
    {
        id: 1,
        char: "散",
        options: [
            { pinyin: "sàn", meaning: "分散,散开", example: "散步" },
            { pinyin: "sǎn", meaning: "零散的", example: "散文" }
        ]
    },
    // ... (完整的32个多音字数据)
];

// 62组近义词数据
const synonymList = [
    { id: 1, word1: "美丽", word2: "漂亮" },
    { id: 2, word1: "快乐", word2: "高兴" },
    // ... (完整的62组近义词数据)
];

// 42组反义词数据
const antonymList = [
    { id: 1, word1: "美丽", word2: "丑陋" },
    { id: 2, word1: "快乐", word2: "悲伤" },
    // ... (完整的42组反义词数据)
];

/**
 * 延迟函数
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 导入词语数据
 */
async function importVocabulary() {
    console.log('开始导入词语数据...');
    let count = 0;

    for (const item of vocabularyList) {
        try {
            await notionService.vocabulary.create({
                ...item,
                courseName: lessons[item.lesson]?.name || ''
            });

            count++;
            console.log(`已导入 ${count}/${vocabularyList.length}: ${item.word}`);

            // 避免超过API速率限制
            await delay(400);
        } catch (error) {
            console.error(`导入失败 (${item.word}):`, error.message);
        }
    }

    console.log(`词语数据导入完成! 成功: ${count}/${vocabularyList.length}`);
}

/**
 * 导入多音字数据
 */
async function importPolyphones() {
    console.log('开始导入多音字数据...');
    let count = 0;

    for (const item of polyphoneList) {
        try {
            await notionService.polyphones.create(item);

            count++;
            console.log(`已导入 ${count}/${polyphoneList.length}: ${item.char}`);

            await delay(400);
        } catch (error) {
            console.error(`导入失败 (${item.char}):`, error.message);
        }
    }

    console.log(`多音字数据导入完成! 成功: ${count}/${polyphoneList.length}`);
}

/**
 * 导入近义词数据
 */
async function importSynonyms() {
    console.log('开始导入近义词数据...');
    let count = 0;

    for (const item of synonymList) {
        try {
            await notionService.synonyms.create(item);

            count++;
            console.log(`已导入 ${count}/${synonymList.length}: ${item.word1} - ${item.word2}`);

            await delay(400);
        } catch (error) {
            console.error(`导入失败 (${item.word1} - ${item.word2}):`, error.message);
        }
    }

    console.log(`近义词数据导入完成! 成功: ${count}/${synonymList.length}`);
}

/**
 * 导入反义词数据
 */
async function importAntonyms() {
    console.log('开始导入反义词数据...');
    let count = 0;

    for (const item of antonymList) {
        try {
            await notionService.antonyms.create(item);

            count++;
            console.log(`已导入 ${count}/${antonymList.length}: ${item.word1} - ${item.word2}`);

            await delay(400);
        } catch (error) {
            console.error(`导入失败 (${item.word1} - ${item.word2}):`, error.message);
        }
    }

    console.log(`反义词数据导入完成! 成功: ${count}/${antonymList.length}`);
}

/**
 * 主函数
 */
async function main() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  Notion数据库初始化脚本                       ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');

    try {
        // 测试连接
        console.log('测试Notion连接...');
        await notionService.testConnection();
        console.log('连接成功!');
        console.log('');

        // 导入数据
        await importVocabulary();
        console.log('');

        await importPolyphones();
        console.log('');

        await importSynonyms();
        console.log('');

        await importAntonyms();
        console.log('');

        console.log('╔════════════════════════════════════════════════╗');
        console.log('║  数据初始化完成!                              ║');
        console.log('╚════════════════════════════════════════════════╝');
    } catch (error) {
        console.error('初始化失败:', error);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    importVocabulary,
    importPolyphones,
    importSynonyms,
    importAntonyms
};
