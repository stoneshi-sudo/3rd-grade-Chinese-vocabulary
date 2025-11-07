# 三年级语文学习系统 v6.0 - Notion云端版

这是一个基于Notion数据库的三年级语文学习系统,采用前后端分离架构,支持多用户、云端数据同步和学习进度跟踪。

## 功能特性

### 🎯 学习模式
- **词语认读** - 146个三年级词语学习
- **纸笔默写** - 真实场景默写练习
- **多音字练习** - 32个常见多音字
- **近义词练习** - 62组近义词
- **反义词练习** - 42组反义词

### ☁️ 云端功能
- **Notion数据库** - 数据安全可靠,支持备份
- **实时同步** - 学习进度自动同步到云端
- **多用户支持** - 每个学生独立账号和进度
- **跨设备学习** - 随时随地访问学习数据
- **教师管理** - 通过Notion查看学生学习情况

### 📊 数据统计
- 学习进度跟踪
- 练习会话历史
- 薄弱环节分析
- 按课程统计

## 技术架构

### 后端
- **框架**: Node.js + Express
- **数据库**: Notion Database
- **认证**: JWT + Session
- **缓存**: node-cache

### 前端
- **技术**: HTML + CSS + JavaScript (原生)
- **架构**: SPA单页应用
- **通信**: Fetch API + RESTful

## 快速开始

### 前置要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Notion账号

### 1. Notion配置

#### 1.1 创建Notion集成
1. 访问 https://www.notion.so/my-integrations
2. 点击"+ New integration"
3. 填写集成信息:
   - Name: `Chinese Vocabulary System`
   - Associated workspace: 选择你的工作区
   - Capabilities: 勾选 `Read content`, `Update content`, `Insert content`
4. 点击"Submit"并复制`Internal Integration Token`

#### 1.2 创建数据库
在Notion中创建以下7个数据库,具体字段请参考 [docs/NOTION_DATABASE_DESIGN.md](docs/NOTION_DATABASE_DESIGN.md):

1. **词语库 (Vocabulary)**
2. **多音字库 (Polyphones)**
3. **近义词库 (Synonyms)**
4. **反义词库 (Antonyms)**
5. **用户表 (Users)**
6. **学习记录 (Learning_Records)**
7. **练习会话 (Practice_Sessions)**

#### 1.3 授权数据库访问
对每个数据库:
1. 点击数据库右上角的"..."
2. 选择"Add connections"
3. 选择刚才创建的集成

#### 1.4 获取数据库ID
对每个数据库:
1. 点击"Share"按钮
2. 复制链接,格式如: `https://www.notion.so/{database_id}?v=...`
3. 提取`{database_id}`部分

### 2. 后端安装

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 编辑.env文件,填入Notion配置
nano .env
```

`.env` 文件配置:
```env
# Notion配置
NOTION_API_KEY=secret_your_integration_token
NOTION_DATABASE_VOCABULARY=your_vocabulary_db_id
NOTION_DATABASE_POLYPHONES=your_polyphones_db_id
NOTION_DATABASE_SYNONYMS=your_synonyms_db_id
NOTION_DATABASE_ANTONYMS=your_antonyms_db_id
NOTION_DATABASE_USERS=your_users_db_id
NOTION_DATABASE_LEARNING_RECORDS=your_learning_records_db_id
NOTION_DATABASE_PRACTICE_SESSIONS=your_practice_sessions_db_id

# JWT密钥(请修改为随机字符串)
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this

# CORS配置
CORS_ORIGIN=http://localhost:8080
```

### 3. 初始化数据

将学习数据导入Notion数据库:

```bash
# 运行初始化脚本
npm run init-data
```

这将导入:
- 146个词语
- 32个多音字
- 62组近义词
- 42组反义词

### 4. 启动后端

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

后端默认运行在 `http://localhost:3000`

### 5. 前端配置

前端使用简单的HTTP服务器即可:

```bash
cd frontend

# 使用Python启动HTTP服务器
python3 -m http.server 8080

# 或使用Node.js的http-server
npx http-server -p 8080
```

访问 `http://localhost:8080` 即可使用系统。

## 使用指南

### 1. 注册账号
首次使用需要注册账号:
- 用户名: 3-20个字符,仅支持字母、数字、下划线
- 密码: 至少6个字符
- 显示名称: 用于显示的名字

### 2. 开始学习
登录后可以选择不同的学习模式:
- **词语认读**: 看词语判断是否认识
- **纸笔默写**: 看拼音在纸上写汉字,然后自我检查
- **多音字/近义词/反义词**: 相应的专项练习

### 3. 查看进度
- 首页显示总体学习进度
- 所有学习记录自动保存到Notion
- 教师可以在Notion中查看每个学生的学习情况

## API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 学习内容接口
- `GET /api/vocabulary` - 获取词语列表
- `GET /api/vocabulary/:id` - 获取单个词语
- `GET /api/polyphones` - 获取多音字列表
- `GET /api/synonyms` - 获取近义词列表
- `GET /api/antonyms` - 获取反义词列表

### 学习记录接口
- `GET /api/learning/records` - 获取学习记录
- `POST /api/learning/records` - 创建学习记录
- `GET /api/learning/sessions` - 获取练习会话
- `POST /api/learning/sessions` - 创建练习会话
- `GET /api/learning/mastered` - 获取已掌握项目

### 统计接口
- `GET /api/stats/overview` - 获取学习概览
- `GET /api/stats/progress` - 获取学习进度详情
- `GET /api/stats/recent-sessions` - 获取最近练习会话
- `GET /api/stats/weak-points` - 获取薄弱环节

详细API文档请查看各路由文件。

## 项目结构

```
.
├── backend/                # 后端代码
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # API路由
│   │   ├── services/      # 服务层(Notion集成)
│   │   ├── scripts/       # 工具脚本
│   │   └── server.js      # 服务器入口
│   ├── package.json
│   └── .env.example
│
├── frontend/              # 前端代码
│   ├── js/
│   │   ├── auth.js       # 认证逻辑
│   │   └── app.js        # 应用主逻辑
│   └── index.html         # 主页面
│
├── docs/                  # 文档
│   ├── NOTION_DATABASE_DESIGN.md  # 数据库设计文档
│   └── SETUP_GUIDE.md     # 详细配置指南
│
└── README.md              # 本文件
```

## 部署到生产环境

### 后端部署
推荐使用以下平台:
- **Railway** - 简单快速
- **Heroku** - 稳定可靠
- **DigitalOcean** - 可控性强
- **自建服务器** - 完全控制

部署步骤:
1. 设置环境变量
2. 安装依赖: `npm install --production`
3. 运行: `npm start`

### 前端部署
推荐使用以下平台:
- **Netlify** - 免费静态托管
- **Vercel** - 性能优秀
- **GitHub Pages** - 简单方便

部署前需要修改 `frontend/index.html` 中的 `API_BASE_URL` 为生产环境后端地址。

## 常见问题

### Q: Notion API调用失败
A: 检查以下几点:
1. Integration Token是否正确
2. 数据库是否已授权给集成
3. 数据库ID是否正确
4. 网络连接是否正常

### Q: 如何备份数据
A: Notion数据可以通过以下方式备份:
1. Notion自带的导出功能
2. 定期使用Notion API导出数据
3. Notion本身提供版本历史

### Q: 如何添加新的词语
A: 有两种方式:
1. 直接在Notion数据库中添加
2. 通过API接口添加(需要教师权限)

### Q: 支持多少用户
A: 取决于Notion API的限制:
- 免费版: 每秒3个请求
- 付费版: 更高的请求限制
- 建议小班教学使用(20-30人)

## 开发计划

- [ ] 移动端优化
- [ ] 离线模式支持
- [ ] 语音朗读功能
- [ ] 学习报告生成
- [ ] 家长端APP
- [ ] 游戏化元素

## 贡献指南

欢迎提交Issue和Pull Request!

## 许可证

MIT License

---

**祝学习愉快! 📚✨**
