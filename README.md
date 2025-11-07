# 📚 三年级语文完整学习系统 v5.2

一个集成 Notion 数据库的三年级语文生词学习系统，支持从 Notion 获取生词并保存学习记录。

## ✨ 功能特性

- 📖 **生词学习**: 从 Notion 数据库加载三年级语文生词
- 📝 **学习记录**: 自动保存学习记录到 Notion 数据库
- 📊 **学习统计**: 实时显示学习进度和掌握情况
- 🎨 **美观界面**: 现代化的渐变色设计，支持响应式布局
- 💾 **数据持久化**: 所有数据存储在 Notion 中，永久保存

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Notion

#### 2.1 创建 Notion Integration

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 "+ New integration"
3. 填写基本信息并创建
4. 复制 "Internal Integration Token"（这就是你的 `NOTION_API_KEY`）

#### 2.2 创建 Notion 数据库

**生词数据库** - 需要包含以下属性：

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 生词 (或 Word/词语) | Title | 生词内容 |
| 拼音 (或 Pinyin) | Text | 拼音标注 |
| 释义 (或 Meaning/意思) | Text | 词语释义 |
| 例句 (或 Example/示例) | Text | 使用例句 |

**学习记录数据库** - 需要包含以下属性（可选，不设置则使用生词数据库）：

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 生词 | Title | 学习的生词 |
| 拼音 | Text | 拼音 |
| 释义 | Text | 释义 |
| 掌握情况 | Select | 认识/不认识 |
| 学习时间 | Date | 学习时间戳 |

#### 2.3 分享数据库给 Integration

1. 打开你创建的 Notion 数据库
2. 点击右上角的 "Share"
3. 找到你创建的 Integration，点击 "Invite"
4. 复制数据库 URL 中的 Database ID

**如何获取 Database ID:**
- 数据库 URL 格式: `https://www.notion.so/workspace/{database_id}?v=...`
- `database_id` 是一串32位字符（去掉连字符）

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_RECORDS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # 可选
PORT=3000
```

### 4. 运行应用

```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

### 5. 访问应用

在浏览器中打开: [http://localhost:3000](http://localhost:3000)

## 📖 使用说明

1. **开始学习**: 点击"开始学习"按钮，系统会从 Notion 加载生词
2. **学习测试**: 看到生词后，选择"认识"或"不认识"
3. **查看详情**: 点击后会显示拼音、释义和例句
4. **下一个**: 点击"下一个"继续学习
5. **查看记录**: 右侧显示实时学习记录
6. **查看进度**: 底部显示学习进度条

## 🗂️ 项目结构

```
3rd-grade-Chinese-vocabulary/
├── public/              # 前端文件
│   ├── index.html      # 主页面
│   ├── style.css       # 样式文件
│   └── app.js          # 前端逻辑
├── server/             # 后端文件
│   ├── index.js        # Express 服务器
│   └── notionService.js # Notion API 服务
├── .env.example        # 环境变量示例
├── .gitignore         # Git 忽略文件
├── package.json       # 项目配置
└── README.md          # 项目文档
```

## 🔌 API 接口

### GET /api/words
获取生词列表

**响应:**
```json
{
  "success": true,
  "count": 10,
  "words": [
    {
      "id": "...",
      "word": "欣赏",
      "pinyin": "xīn shǎng",
      "meaning": "享受美好的事物，领略其中的趣味",
      "example": "我们一起欣赏美丽的风景。"
    }
  ]
}
```

### POST /api/records
保存学习记录

**请求体:**
```json
{
  "word": "欣赏",
  "pinyin": "xīn shǎng",
  "meaning": "享受美好的事物，领略其中的趣味",
  "know": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### GET /api/statistics
获取学习统计

**响应:**
```json
{
  "todayCount": 10,
  "totalWords": 50,
  "masterRate": 80
}
```

### GET /api/health
健康检查

## 📝 Notion 数据库示例

### 生词数据库示例

| 生词 | 拼音 | 释义 | 例句 |
|-----|------|------|------|
| 欣赏 | xīn shǎng | 享受美好的事物，领略其中的趣味 | 我们一起欣赏美丽的风景。 |
| 珍贵 | zhēn guì | 价值高；意义大；宝贵 | 时间是最珍贵的财富。 |
| 观察 | guān chá | 仔细察看客观事物或现象 | 我们要学会观察生活中的细节。 |

## 🎨 界面预览

- 渐变紫色主题设计
- 卡片式生词展示
- 实时学习记录显示
- 进度条可视化
- 响应式布局，支持移动端

## 🔧 常见问题

### 1. 连接 Notion 失败？

- 检查 `NOTION_API_KEY` 是否正确
- 确认数据库已分享给 Integration
- 检查 `NOTION_DATABASE_ID` 格式是否正确

### 2. 获取不到生词？

- 确认数据库中有数据
- 检查数据库属性名称是否匹配（支持多种命名）
- 查看服务器控制台的错误信息

### 3. 学习记录保存失败？

- 如果使用单独的记录数据库，确认已设置 `NOTION_RECORDS_DATABASE_ID`
- 检查数据库属性配置
- 确认 Integration 有写入权限

## 📦 依赖项

- `express`: Web 服务器框架
- `@notionhq/client`: Notion 官方 SDK
- `dotenv`: 环境变量管理
- `cors`: 跨域资源共享

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请创建 Issue。

---

**版本**: v5.2.0
**更新日期**: 2024

祝学习愉快！📚✨
