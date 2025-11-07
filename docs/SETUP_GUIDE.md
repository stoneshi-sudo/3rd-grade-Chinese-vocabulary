# 详细配置指南

本文档提供了Notion集成配置的详细步骤说明。

## 目录
1. [Notion集成配置](#notion集成配置)
2. [数据库创建](#数据库创建)
3. [环境变量配置](#环境变量配置)
4. [数据初始化](#数据初始化)
5. [故障排查](#故障排查)

## Notion集成配置

### 步骤1: 创建Notion集成

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 **"+ New integration"** 按钮
3. 填写以下信息:

   | 字段 | 值 |
   |------|-----|
   | Name | Chinese Vocabulary System |
   | Logo | (可选)上传一个logo |
   | Associated workspace | 选择你的工作区 |
   | Type | Internal |

4. 在 **Capabilities** 部分,勾选以下权限:
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
   - ⬜ Read comments (不需要)
   - ⬜ Insert comments (不需要)
   - ⬜ Read user information (不需要)

5. 点击 **"Submit"** 提交
6. 复制显示的 **Internal Integration Token**
   - 格式: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 保存此token,后续需要配置到.env文件中

### 步骤2: 了解Notion数据库概念

在Notion中,数据库就是一个特殊的页面,可以用表格、看板等多种视图显示。我们需要创建7个数据库。

## 数据库创建

### 数据库1: 词语库 (Vocabulary)

1. 在Notion中创建新页面,命名为 "词语库"
2. 在页面中输入 `/database` 选择 "Table - Inline"
3. 创建以下属性列:

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 词语 | Title | 默认的标题列 |
| 拼音 | Text | 词语的拼音 |
| 释义 | Text | 词语的解释 |
| 课程 | Select | 所属课程(lesson1~16, other) |
| 课程名称 | Text | 课程的完整名称 |
| 是否新增 | Checkbox | 标记新增词语 |
| 词语ID | Number | 唯一标识符(1-146) |
| 创建时间 | Created time | 自动生成 |
| 更新时间 | Last edited time | 自动生成 |

**课程Select选项:**
创建Select属性时,添加以下选项:
- lesson1
- lesson2
- lesson3
- lesson4
- lesson5
- lesson6
- lesson7
- lesson8
- lesson9
- lesson10
- lesson11
- lesson12
- lesson13
- lesson14
- lesson15
- lesson16
- other

4. 点击数据库右上角的 **"..."**
5. 选择 **"Add connections"**
6. 选择刚才创建的集成 "Chinese Vocabulary System"

### 数据库2: 多音字库 (Polyphones)

1. 创建新页面 "多音字库"
2. 创建Table数据库,添加以下列:

| 属性名称 | 类型 |
|---------|------|
| 汉字 | Title |
| 读音1 | Text |
| 读音1释义 | Text |
| 读音1例词 | Text |
| 读音2 | Text |
| 读音2释义 | Text |
| 读音2例词 | Text |
| 读音3 | Text |
| 读音3释义 | Text |
| 读音3例词 | Text |
| 是否新增 | Checkbox |
| 多音字ID | Number |

3. 授权集成访问此数据库

### 数据库3: 近义词库 (Synonyms)

1. 创建新页面 "近义词库"
2. 创建Table数据库:

| 属性名称 | 类型 |
|---------|------|
| 词语1 | Title |
| 词语2 | Text |
| 是否新增 | Checkbox |
| 来源 | Text |
| 近义词ID | Number |

3. 授权集成访问

### 数据库4: 反义词库 (Antonyms)

1. 创建新页面 "反义词库"
2. 创建Table数据库:

| 属性名称 | 类型 |
|---------|------|
| 词语1 | Title |
| 词语2 | Text |
| 反义词ID | Number |

3. 授权集成访问

### 数据库5: 用户表 (Users)

1. 创建新页面 "用户表"
2. 创建Table数据库:

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 用户名 | Title | 用户登录名 |
| 显示名称 | Text | 显示名称 |
| 用户ID | Text | UUID |
| 密码哈希 | Text | bcrypt加密的密码 |
| 角色 | Select | student或teacher |
| 创建时间 | Created time | 注册时间 |
| 最后登录 | Date | 最后登录时间 |
| 总学习时长 | Number | 累计学习时长(秒) |
| 学习天数 | Number | 累计学习天数 |

**角色Select选项:**
- student
- teacher

3. 授权集成访问

### 数据库6: 学习记录 (Learning_Records)

1. 创建新页面 "学习记录"
2. 创建Table数据库:

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 记录ID | Title | UUID |
| 学习类型 | Select | vocabulary/dictation/polyphone/synonym/antonym |
| 项目ID | Number | 学习项目的ID |
| 项目类型 | Select | vocabulary/polyphone/synonym/antonym |
| 是否掌握 | Checkbox | 是否掌握 |
| 学习时间 | Date | 学习的时间 |
| 课程 | Select | 课程(可选) |
| 创建时间 | Created time | 记录创建时间 |

**学习类型Select选项:**
- vocabulary
- dictation
- polyphone
- synonym
- antonym

**项目类型Select选项:**
- vocabulary
- polyphone
- synonym
- antonym

**课程Select选项:** (同词语库)

3. 授权集成访问

### 数据库7: 练习会话 (Practice_Sessions)

1. 创建新页面 "练习会话"
2. 创建Table数据库:

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 会话ID | Title | UUID |
| 学习类型 | Select | vocabulary/dictation/polyphone/synonym/antonym |
| 课程 | Select | 练习的课程 |
| 开始时间 | Date | 练习开始时间 |
| 结束时间 | Date | 练习结束时间 |
| 用时 | Number | 用时(秒) |
| 总题数 | Number | 总题数 |
| 正确数 | Number | 正确数 |
| 错误数 | Number | 错误数 |
| 正确率 | Number | 正确率(%) |
| 创建时间 | Created time | 记录创建时间 |

3. 授权集成访问

## 获取数据库ID

对每个数据库:

1. 打开数据库页面
2. 点击右上角的 **"Share"** 按钮
3. 点击 **"Copy link"** 复制链接
4. 链接格式为: `https://www.notion.so/workspace名称/数据库ID?v=视图ID`
5. 提取中间的数据库ID部分

例如:
```
https://www.notion.so/myworkspace/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4?v=...
                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                     这部分就是数据库ID
```

数据库ID通常是32个字符的十六进制字符串。

## 环境变量配置

1. 复制环境变量模板:
```bash
cd backend
cp .env.example .env
```

2. 编辑 `.env` 文件:
```bash
nano .env
```

3. 填入配置信息:

```env
# Notion API Key (从步骤1获得)
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 数据库ID (从步骤2获得)
NOTION_DATABASE_VOCABULARY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_POLYPHONES=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_SYNONYMS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ANTONYMS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_USERS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_LEARNING_RECORDS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_PRACTICE_SESSIONS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT配置 (生成随机字符串)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# CORS配置
CORS_ORIGIN=http://localhost:8080
```

**生成随机密钥:**
```bash
# 在终端中运行
openssl rand -base64 32
```

## 数据初始化

### 方法1: 使用初始化脚本(推荐)

```bash
cd backend
npm install
npm run init-data
```

这将自动导入所有学习数据到Notion数据库。

### 方法2: 手动导入

如果脚本失败,可以手动在Notion数据库中添加数据。

参考 `backend/src/scripts/initNotionData.js` 中的数据。

## 验证配置

### 1. 测试Notion连接

```bash
cd backend
npm start
```

启动服务器,如果看到:
```
Notion connection successful!
Server is running on http://localhost:3000
```

说明Notion连接成功。

### 2. 测试API

访问健康检查端点:
```bash
curl http://localhost:3000/health
```

应该返回:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "environment": "development"
}
```

### 3. 测试数据获取

```bash
curl http://localhost:3000/api/vocabulary
```

应该返回词语列表。

## 故障排查

### 问题1: "Notion connection test failed"

**原因:**
- Integration Token错误
- 数据库ID错误
- 数据库未授权给集成

**解决:**
1. 检查 `.env` 中的 `NOTION_API_KEY` 是否正确
2. 检查数据库ID是否正确
3. 确认每个数据库都已添加集成连接

### 问题2: "Database not found"

**原因:**
- 数据库ID错误
- 数据库未授权

**解决:**
1. 重新获取数据库ID
2. 检查数据库是否添加了集成连接

### 问题3: "Rate limit exceeded"

**原因:**
- 请求过于频繁,超过Notion API限制(每秒3个请求)

**解决:**
- 代码中已实现速率限制,稍等片刻再试
- 检查是否有多个进程同时访问API

### 问题4: 数据库属性不匹配

**原因:**
- 数据库列名或类型不正确

**解决:**
1. 检查数据库属性名称拼写
2. 确保属性类型正确(Text, Number, Select等)
3. 参考本文档重新检查数据库结构

### 问题5: 初始化脚本失败

**原因:**
- 网络问题
- 数据库未准备好
- 权限问题

**解决:**
1. 检查网络连接
2. 确认所有数据库已创建并授权
3. 查看错误日志,针对性解决

## 常用命令

```bash
# 测试Notion连接
curl http://localhost:3000/health

# 查看词语数量
curl http://localhost:3000/api/vocabulary | jq '.count'

# 查看多音字数量
curl http://localhost:3000/api/polyphones | jq '.count'

# 注册测试用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","displayName":"测试用户"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

## 下一步

配置完成后,可以:
1. 启动前端服务器
2. 注册用户账号
3. 开始使用学习系统

详见主README文档。
