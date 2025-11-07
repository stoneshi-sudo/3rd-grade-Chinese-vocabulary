const { Client } = require('@notionhq/client');

class NotionService {
    constructor() {
        this.notion = new Client({
            auth: process.env.NOTION_API_KEY
        });
        this.vocabularyDatabaseId = process.env.NOTION_DATABASE_ID;
        this.recordsDatabaseId = process.env.NOTION_RECORDS_DATABASE_ID;
    }

    /**
     * 从 Notion 数据库获取生词列表
     */
    async getVocabularyWords() {
        try {
            const response = await this.notion.databases.query({
                database_id: this.vocabularyDatabaseId,
                page_size: 100,
            });

            const words = response.results.map(page => {
                const properties = page.properties;

                return {
                    id: page.id,
                    word: this.getPropertyValue(properties['生词'] || properties['Word'] || properties['词语']),
                    pinyin: this.getPropertyValue(properties['拼音'] || properties['Pinyin']),
                    meaning: this.getPropertyValue(properties['释义'] || properties['Meaning'] || properties['意思']),
                    example: this.getPropertyValue(properties['例句'] || properties['Example'] || properties['示例']),
                };
            });

            return words.filter(word => word.word); // 过滤掉没有词语的条目
        } catch (error) {
            console.error('Error fetching vocabulary from Notion:', error);
            throw error;
        }
    }

    /**
     * 保存学习记录到 Notion
     */
    async saveStudyRecord(record) {
        try {
            // 如果没有配置记录数据库ID，使用同一个数据库
            const databaseId = this.recordsDatabaseId || this.vocabularyDatabaseId;

            const response = await this.notion.pages.create({
                parent: {
                    database_id: databaseId
                },
                properties: {
                    '生词': {
                        title: [
                            {
                                text: {
                                    content: record.word
                                }
                            }
                        ]
                    },
                    '拼音': {
                        rich_text: [
                            {
                                text: {
                                    content: record.pinyin || ''
                                }
                            }
                        ]
                    },
                    '释义': {
                        rich_text: [
                            {
                                text: {
                                    content: record.meaning || ''
                                }
                            }
                        ]
                    },
                    '掌握情况': {
                        select: {
                            name: record.know ? '认识' : '不认识'
                        }
                    },
                    '学习时间': {
                        date: {
                            start: record.timestamp
                        }
                    }
                }
            });

            return response;
        } catch (error) {
            console.error('Error saving record to Notion:', error);
            throw error;
        }
    }

    /**
     * 获取统计信息
     */
    async getStatistics() {
        try {
            const databaseId = this.recordsDatabaseId || this.vocabularyDatabaseId;

            // 获取今天的记录
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const response = await this.notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: '学习时间',
                    date: {
                        on_or_after: today.toISOString()
                    }
                }
            });

            const todayCount = response.results.length;
            const knownCount = response.results.filter(page => {
                const status = this.getPropertyValue(page.properties['掌握情况']);
                return status === '认识';
            }).length;

            // 获取总词汇量
            const totalResponse = await this.notion.databases.query({
                database_id: this.vocabularyDatabaseId,
                page_size: 1
            });

            const totalWords = totalResponse.results.length;
            const masterRate = todayCount > 0 ? Math.round((knownCount / todayCount) * 100) : 0;

            return {
                todayCount,
                totalWords,
                masterRate
            };
        } catch (error) {
            console.error('Error getting statistics from Notion:', error);
            return {
                todayCount: 0,
                totalWords: 0,
                masterRate: 0
            };
        }
    }

    /**
     * 提取 Notion 属性值的辅助方法
     */
    getPropertyValue(property) {
        if (!property) return '';

        switch (property.type) {
            case 'title':
                return property.title[0]?.plain_text || '';
            case 'rich_text':
                return property.rich_text[0]?.plain_text || '';
            case 'select':
                return property.select?.name || '';
            case 'date':
                return property.date?.start || '';
            case 'number':
                return property.number || 0;
            default:
                return '';
        }
    }
}

module.exports = NotionService;
