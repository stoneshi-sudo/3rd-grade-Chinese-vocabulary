# 快速开始指南

5分钟快速体验三年级语文学习系统!

## 📋 前置准备

确保你已安装:
- [Node.js](https://nodejs.org/) (v18+)
- [Notion](https://www.notion.so/) 账号

## 🚀 快速部署(5步)

### 1️⃣ 创建Notion集成 (2分钟)

1. 访问 https://www.notion.so/my-integrations
2. 点击 **"+ New integration"**
3. 命名为 `Chinese Vocabulary` 并选择工作区
4. 复制 **Integration Token** (以`secret_`开头)

### 2️⃣ 创建Notion数据库 (2分钟)

在Notion中创建7个数据库(详细字段见 [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)):

**快速方法:** 使用模板
1. 复制我们的[Notion模板](链接待添加)
2. 在每个数据库中添加集成连接

**手动方法:**
创建以下数据库并添加对应字段:
- 词语库 (Vocabulary)
- 多音字库 (Polyphones)
- 近义词库 (Synonyms)
- 反义词库 (Antonyms)
- 用户表 (Users)
- 学习记录 (Learning_Records)
- 练习会话 (Practice_Sessions)

### 3️⃣ 配置后端 (1分钟)

```bash
# 克隆项目
git clone https://github.com/stoneshi-sudo/3rd-grade-Chinese-vocabulary.git
cd 3rd-grade-Chinese-vocabulary/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env  # 填入你的Notion配置
```

在 `.env` 中填入:
```env
NOTION_API_KEY=你的Integration_Token
NOTION_DATABASE_VOCABULARY=词语库的数据库ID
NOTION_DATABASE_POLYPHONES=多音字库的数据库ID
NOTION_DATABASE_SYNONYMS=近义词库的数据库ID
NOTION_DATABASE_ANTONYMS=反义词库的数据库ID
NOTION_DATABASE_USERS=用户表的数据库ID
NOTION_DATABASE_LEARNING_RECORDS=学习记录的数据库ID
NOTION_DATABASE_PRACTICE_SESSIONS=练习会话的数据库ID
```

**获取数据库ID:** 打开数据库 → Share → Copy link → 提取URL中的ID部分

### 4️⃣ 初始化数据 (1分钟)

```bash
# 导入学习数据到Notion
npm run init-data
```

这将导入:
- ✅ 146个三年级词语
- ✅ 32个多音字
- ✅ 62组近义词
- ✅ 42组反义词

### 5️⃣ 启动应用 (1分钟)

**终端1 - 启动后端:**
```bash
cd backend
npm run dev
# 后端运行在 http://localhost:3000
```

**终端2 - 启动前端:**
```bash
cd frontend
python3 -m http.server 8080
# 或使用: npx http-server -p 8080
# 前端运行在 http://localhost:8080
```

## 🎉 开始使用

1. 浏览器访问 http://localhost:8080
2. 注册新账号
3. 开始学习!

## 📱 使用提示

### 注册账号
- 用户名: 3-20个字符,仅字母数字下划线
- 密码: 至少6个字符
- 显示名称: 你的名字

### 学习模式
- **词语认读** 📖 - 看词判断是否认识
- **纸笔默写** ✍️ - 看拼音在纸上写汉字
- **多音字** 🔤 - 学习多音字不同读音
- **近义词** 🔄 - 学习近义词配对
- **反义词** ↕️ - 学习反义词配对

### 云端同步
- ✅ 所有学习进度自动保存到Notion
- ✅ 更换设备登录可继续学习
- ✅ 教师可在Notion查看学生进度

## 🆘 遇到问题?

### 常见问题

**Q: 后端启动失败 "Notion connection failed"**
```bash
# 检查配置
cat backend/.env | grep NOTION_API_KEY
# 确保token正确且数据库已授权
```

**Q: 数据导入失败**
```bash
# 检查数据库是否已添加集成连接
# Notion数据库 → ... → Add connections → 选择你的集成
```

**Q: 前端无法连接后端**
```bash
# 确保后端正在运行
curl http://localhost:3000/health
# 应返回: {"status":"ok",...}
```

详细故障排查见 [SETUP_GUIDE.md](docs/SETUP_GUIDE.md#故障排查)

## 📚 更多文档

- [完整README](README.md) - 详细介绍和功能说明
- [数据库设计](docs/NOTION_DATABASE_DESIGN.md) - Notion数据库结构
- [配置指南](docs/SETUP_GUIDE.md) - 详细配置步骤

## 🎯 下一步

- [ ] 邀请学生注册账号
- [ ] 在Notion中查看学习数据
- [ ] 部署到生产环境
- [ ] 自定义词语库

---

**需要帮助?** 提交 [Issue](https://github.com/stoneshi-sudo/3rd-grade-Chinese-vocabulary/issues)

**祝学习愉快! 🎊**
