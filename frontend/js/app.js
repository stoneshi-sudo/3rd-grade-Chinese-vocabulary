/**
 * 应用主逻辑
 * 集成Notion API的学习系统
 */

// 应用状态
let appState = {
    vocabularyList: [],
    polyphoneList: [],
    synonymList: [],
    antonymList: [],
    lessons: {},
    currentMode: null,
    currentLesson: null,
    currentItems: [],
    currentIndex: 0,
    results: [],
    wrongItems: [],
    startTime: null,
    timerInterval: null,
    learnedItems: new Set(),
    awaitingAnswer: false,
    stats: null
};

/**
 * 初始化应用
 */
async function initApp() {
    const container = document.getElementById('app-container');

    // 显示加载中
    container.innerHTML = '<div class="loading">正在加载学习数据</div>';

    try {
        // 加载所有数据
        await Promise.all([
            loadVocabulary(),
            loadPolyphones(),
            loadSynonyms(),
            loadAntonyms(),
            loadStats()
        ]);

        // 渲染主页
        renderHomePage();

    } catch (error) {
        console.error('Failed to load data:', error);
        container.innerHTML = `
            <div class="card">
                <div class="error-message">加载数据失败: ${error.message}</div>
                <button onclick="logout()">返回登录</button>
            </div>
        `;
    }
}

/**
 * 加载词语数据
 */
async function loadVocabulary() {
    const data = await apiRequest('/vocabulary');
    appState.vocabularyList = data.data;
}

/**
 * 加载多音字数据
 */
async function loadPolyphones() {
    const data = await apiRequest('/polyphones');
    appState.polyphoneList = data.data;
}

/**
 * 加载近义词数据
 */
async function loadSynonyms() {
    const data = await apiRequest('/synonyms');
    appState.synonymList = data.data;
}

/**
 * 加载反义词数据
 */
async function loadAntonyms() {
    const data = await apiRequest('/antonyms');
    appState.antonymList = data.data;
}

/**
 * 加载统计数据
 */
async function loadStats() {
    try {
        const data = await apiRequest('/stats/overview');
        appState.stats = data;

        // 从统计数据中恢复已掌握的项目
        const masteredData = await apiRequest('/learning/mastered');
        masteredData.data.forEach(item => {
            const key = `${item.learningType}-${item.itemId}`;
            appState.learnedItems.add(key);
        });
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

/**
 * 渲染主页
 */
function renderHomePage() {
    const stats = appState.stats || {
        totalLearned: 0,
        progress: 0
    };

    const html = `
        <div class="card">
            <div class="user-info">
                <div>
                    <strong>欢迎,${currentUser.displayName}!</strong>
                    <span style="color: #999; margin-left: 10px;">@${currentUser.username}</span>
                </div>
                <button class="btn-secondary" onclick="logout()">退出登录</button>
            </div>

            <h1>三年级语文完整学习系统 v6.0 <span class="cloud-badge">云端版</span></h1>
            <p class="subtitle">Notion云端存储 - 学习进度实时同步到云端</p>

            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.totalLearned || 0}</div>
                    <div class="stat-label">已掌握项目</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">282</div>
                    <div class="stat-label">总学习项目</div>
                </div>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" style="width: ${stats.progress || 0}%"></div>
            </div>

            <div class="button-grid">
                <button onclick="showLessonSelector('vocabulary')">📖 词语认读<br><small>(${appState.vocabularyList.length}个词语)</small></button>
                <button onclick="showLessonSelector('dictation')" class="btn-warning">✍️ 纸笔默写<br><small>(${appState.vocabularyList.length}个词语)</small></button>
                <button onclick="startPractice('polyphone', 'all')">🔤 多音字练习<br><small>(${appState.polyphoneList.length}个)</small></button>
                <button onclick="startPractice('synonym', 'all')">🔄 近义词练习<br><small>(${appState.synonymList.length}组)</small></button>
                <button onclick="startPractice('antonym', 'all')">↕️ 反义词练习<br><small>(${appState.antonymList.length}组)</small></button>
            </div>

            <div class="info-box">
                <p style="font-weight: bold; color: #4CAF50;">✨ v6.0 云端版本 ⭐</p>
                <p>✅ Notion云端数据库,数据安全可靠</p>
                <p>✅ 学习进度实时同步,随时随地学习</p>
                <p>✅ 多用户支持,每个学生独立进度</p>
                <p>✅ 教师可通过Notion查看学生学习情况</p>
                <p>📚 认读+默写双管齐下,学习效果更好</p>
            </div>
        </div>
    `;

    document.getElementById('app-container').innerHTML = html;
}

/**
 * 显示课程选择器
 */
function showLessonSelector(mode) {
    appState.currentMode = mode;

    // 统计每个课程的词语数量
    const lessonCounts = {};
    appState.vocabularyList.forEach(item => {
        const lesson = item.lesson || 'other';
        lessonCounts[lesson] = (lessonCounts[lesson] || 0) + 1;
    });

    // 生成课程按钮
    let lessonButtonsHtml = '<button class="lesson-btn" onclick="startPractice(\'' + mode + '\', \'all\')"><div>📚 全部课文</div><span class="lesson-count">' + appState.vocabularyList.length + '个词语</span></button>';

    // 课程列表(简化版)
    const lessonNames = {
        'lesson1': '大青树下的小学',
        'lesson2': '花的学校',
        'lesson3': '不懂就要问',
        'lesson4': '古诗三首',
        'lesson5': '铺满金色巴掌',
        'lesson6': '秋天的雨',
        'lesson7': '听听秋的声音',
        'lesson8': '去年的树',
        'lesson9': '那一定会很好',
        'lesson10': '在牛肚子里旅行',
        'lesson11': '一块奶酪',
        'lesson12': '总也倒不了的老屋',
        'lesson13': '胡萝卜先生的长胡子',
        'lesson14': '小狗学叫',
        'lesson15': '搭船的鸟',
        'lesson16': '金色的草地',
        'other': '其他'
    };

    Object.keys(lessonNames).forEach(lessonId => {
        const count = lessonCounts[lessonId] || 0;
        if (count > 0) {
            lessonButtonsHtml += '<button class="lesson-btn" onclick="startPractice(\'' + mode + '\', \'' + lessonId + '\')"><div>' + lessonNames[lessonId] + '</div><span class="lesson-count">' + count + '个词语</span></button>';
        }
    });

    const html = `
        <div class="card">
            <h1>📚 选择课程</h1>
            <p class="subtitle">选择要${mode === 'dictation' ? '默写' : '练习'}的课文,或选择"全部"进行混合${mode === 'dictation' ? '默写' : '练习'}</p>

            <div class="lesson-selector">
                <h3>请选择课程:</h3>
                <div class="lesson-buttons">${lessonButtonsHtml}</div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <button onclick="renderHomePage()">返回首页</button>
            </div>
        </div>
    `;

    document.getElementById('app-container').innerHTML = html;
}

/**
 * 开始练习
 */
function startPractice(mode, lesson) {
    appState.currentMode = mode;
    appState.currentLesson = lesson || 'all';
    appState.currentIndex = 0;
    appState.results = [];
    appState.wrongItems = [];
    appState.startTime = Date.now();
    appState.awaitingAnswer = false;

    // 根据模式筛选数据
    if (mode === 'vocabulary' || mode === 'dictation') {
        if (lesson === 'all') {
            appState.currentItems = [...appState.vocabularyList];
        } else {
            appState.currentItems = appState.vocabularyList.filter(item => item.lesson === lesson);
        }
        appState.currentItems.sort(() => Math.random() - 0.5);
    } else if (mode === 'polyphone') {
        appState.currentItems = [...appState.polyphoneList].sort(() => Math.random() - 0.5);
    } else if (mode === 'synonym') {
        appState.currentItems = [...appState.synonymList].sort(() => Math.random() - 0.5);
    } else if (mode === 'antonym') {
        appState.currentItems = [...appState.antonymList].sort(() => Math.random() - 0.5);
    }

    if (appState.currentItems.length === 0) {
        alert('该课程暂无内容');
        return;
    }

    startTimer();
    renderPracticeView();
}

/**
 * 渲染练习视图
 */
function renderPracticeView() {
    if (appState.currentIndex >= appState.currentItems.length) {
        showResults();
        return;
    }

    const item = appState.currentItems[appState.currentIndex];
    const progress = ((appState.currentIndex + 1) / appState.currentItems.length) * 100;

    let modeTitle = '';
    let modeBadge = '';
    let contentHtml = '';
    let buttonsHtml = '';

    // 根据不同模式生成内容
    if (appState.currentMode === 'vocabulary') {
        modeTitle = '词语认读';
        modeBadge = appState.currentItems.length + '个词语';

        const newBadge = item.isNew ? '<span class="new-badge">课文新增</span>' : '';
        contentHtml = `
            <div class="word">${item.word}${newBadge}</div>
            <div class="pinyin">${item.pinyin}</div>
            <div class="meaning">${item.meaning}</div>
        `;
        buttonsHtml = `
            <button class="btn-danger" onclick="answerQuestion(false)">❌ 不认识</button>
            <button class="btn-success" onclick="answerQuestion(true)">✓ 认识</button>
        `;
    } else if (appState.currentMode === 'dictation') {
        modeTitle = '纸笔默写';
        modeBadge = appState.currentItems.length + '个词语';

        if (!appState.awaitingAnswer) {
            const newBadge = item.isNew ? '<span class="new-badge">课文新增</span>' : '';
            contentHtml = `
                <div class="pinyin">${item.pinyin}${newBadge}</div>
                <div class="meaning">${item.meaning}</div>
                <div class="dictation-instruction">
                    <div class="write-icon">✍️📝</div>
                    <h3>请在纸上写出这个词语</h3>
                    <p>看拼音和释义,用笔在纸上写汉字</p>
                    <p>写完后点击下方按钮查看答案</p>
                </div>
            `;
            buttonsHtml = '<button class="btn-success" onclick="showDictationAnswer()">👀 查看答案</button>';
        } else {
            contentHtml = `
                <div class="pinyin">${item.pinyin}</div>
                <div class="meaning">${item.meaning}</div>
                <div style="margin: 30px 0; padding: 30px; background: #e8f5e9; border-radius: 15px;">
                    <div style="font-size: 20px; color: #2e7d32; margin-bottom: 15px;">正确答案:</div>
                    <div class="word" style="color: #11998e;">${item.word}</div>
                </div>
                <div style="font-size: 18px; color: #666;">请对照你纸上写的答案</div>
            `;
            buttonsHtml = `
                <button class="btn-danger" onclick="markDictation(false)">❌ 写错了</button>
                <button class="btn-success" onclick="markDictation(true)">✓ 写对了</button>
            `;
        }
    } else if (appState.currentMode === 'polyphone') {
        modeTitle = '多音字练习';
        modeBadge = appState.polyphoneList.length + '个多音字';

        const newBadge = item.isNew ? '<span class="new-badge">课文</span>' : '';
        let optionsHtml = '';
        item.options.forEach(opt => {
            optionsHtml += `
                <div style="margin: 15px 0; text-align: left;">
                    <div style="font-size: 24px; color: #667eea; font-weight: bold;">${opt.pinyin}</div>
                    <div style="font-size: 18px; color: #666;">${opt.meaning} (例: ${opt.example})</div>
                </div>
            `;
        });

        contentHtml = `
            <div class="word">${item.char}${newBadge}</div>
            <div style="margin-top: 20px;">${optionsHtml}</div>
        `;
        buttonsHtml = `
            <button class="btn-danger" onclick="answerQuestion(false)">❌ 不熟悉</button>
            <button class="btn-success" onclick="answerQuestion(true)">✓ 掌握了</button>
        `;
    } else if (appState.currentMode === 'synonym' || appState.currentMode === 'antonym') {
        modeTitle = appState.currentMode === 'synonym' ? '近义词练习' : '反义词练习';
        modeBadge = appState.currentItems.length + '组';

        const title = appState.currentMode === 'synonym' ? '这两个词是近义词吗?' : '这两个词是反义词吗?';
        const newBadge = item.isNew ? '<span class="new-badge">课文</span>' : '';

        contentHtml = `
            <div style="font-size: 28px; color: #667eea; margin-bottom: 30px;">${title}${newBadge}</div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 40px; margin: 40px 0;">
                <div class="word">${item.word1}</div>
                <div style="font-size: 48px; color: #667eea;">↔</div>
                <div class="word">${item.word2}</div>
            </div>
        `;
        buttonsHtml = `
            <button class="btn-success" onclick="answerQuestion(true)">✓ 是的</button>
            <button class="btn-danger" onclick="answerQuestion(false)">❌ 不是</button>
        `;
    }

    const html = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <span style="font-size: 20px; font-weight: bold; color: #667eea;">
                        ${modeTitle}
                        <span class="mode-badge">${modeBadge}</span>
                    </span>
                </div>
                <div>
                    <span style="font-size: 18px; font-weight: bold;">
                        ⏱️ <span id="timer">0:00</span>
                    </span>
                    <span style="font-size: 18px; font-weight: bold; margin-left: 20px;">
                        ${appState.currentIndex + 1} / ${appState.currentItems.length}
                    </span>
                </div>
                <button onclick="exitPractice()">退出</button>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>

            <div class="word-card">
                ${contentHtml}
            </div>

            <div class="action-buttons">
                ${buttonsHtml}
            </div>
        </div>
    `;

    document.getElementById('app-container').innerHTML = html;
}

/**
 * 显示默写答案
 */
function showDictationAnswer() {
    appState.awaitingAnswer = true;
    renderPracticeView();
}

/**
 * 标记默写结果
 */
async function markDictation(isCorrect) {
    const item = appState.currentItems[appState.currentIndex];

    // 记录结果
    appState.results.push({ item, known: isCorrect });

    if (isCorrect) {
        appState.learnedItems.add('dictation-' + item.id);
    } else {
        appState.wrongItems.push(item);
    }

    // 保存学习记录到服务器
    try {
        await apiRequest('/learning/records', {
            method: 'POST',
            body: JSON.stringify({
                learningType: 'dictation',
                itemId: item.id,
                itemType: 'vocabulary',
                mastered: isCorrect,
                lesson: item.lesson
            })
        });
    } catch (error) {
        console.error('Failed to save learning record:', error);
    }

    appState.awaitingAnswer = false;
    appState.currentIndex++;
    renderPracticeView();
}

/**
 * 回答问题(认读、多音字、近反义词)
 */
async function answerQuestion(known) {
    const item = appState.currentItems[appState.currentIndex];

    appState.results.push({ item, known });

    if (known) {
        appState.learnedItems.add(appState.currentMode + '-' + item.id);
    } else {
        appState.wrongItems.push(item);
    }

    // 保存学习记录
    try {
        let itemType = 'vocabulary';
        if (appState.currentMode === 'polyphone') itemType = 'polyphone';
        else if (appState.currentMode === 'synonym') itemType = 'synonym';
        else if (appState.currentMode === 'antonym') itemType = 'antonym';

        await apiRequest('/learning/records', {
            method: 'POST',
            body: JSON.stringify({
                learningType: appState.currentMode,
                itemId: item.id,
                itemType: itemType,
                mastered: known,
                lesson: item.lesson || null
            })
        });
    } catch (error) {
        console.error('Failed to save learning record:', error);
    }

    appState.currentIndex++;
    renderPracticeView();
}

/**
 * 显示结果
 */
async function showResults() {
    stopTimer();

    const correctCount = appState.results.filter(r => r.known).length;
    const wrongCount = appState.results.filter(r => !r.known).length;
    const accuracy = Math.round((correctCount / appState.results.length) * 100);
    const timeUsed = Math.floor((Date.now() - appState.startTime) / 1000);
    const mins = Math.floor(timeUsed / 60);
    const secs = timeUsed % 60;
    const timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;

    // 保存练习会话
    try {
        await apiRequest('/learning/sessions', {
            method: 'POST',
            body: JSON.stringify({
                learningType: appState.currentMode,
                lesson: appState.currentLesson,
                startTime: new Date(appState.startTime).toISOString(),
                endTime: new Date().toISOString(),
                totalQuestions: appState.results.length,
                correctCount: correctCount,
                wrongCount: wrongCount
            })
        });
    } catch (error) {
        console.error('Failed to save practice session:', error);
    }

    const reviewBtnStyle = wrongCount > 0 ? '' : 'display: none;';

    const html = `
        <div class="card">
            <h1>🎉 练习完成!</h1>
            <p class="subtitle">学习进度已同步到云端</p>

            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value" style="color: #11998e;">${correctCount}</div>
                    <div class="stat-label">正确数量</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: #ee0979;">${wrongCount}</div>
                    <div class="stat-label">需要加强</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: #667eea;">${accuracy}%</div>
                    <div class="stat-label">正确率</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: #764ba2;">${timeStr}</div>
                    <div class="stat-label">用时</div>
                </div>
            </div>

            <div class="button-grid">
                <button onclick="renderHomePage()">🏠 返回首页</button>
                <button onclick="startPractice('${appState.currentMode}', '${appState.currentLesson}')" class="btn-success">🔄 再练一次</button>
                <button onclick="reviewWrongItems()" class="btn-warning" style="${reviewBtnStyle}">📝 复习错题</button>
            </div>
        </div>
    `;

    document.getElementById('app-container').innerHTML = html;

    // 重新加载统计数据
    await loadStats();
}

/**
 * 复习错题
 */
function reviewWrongItems() {
    if (appState.wrongItems.length === 0) {
        alert('没有错题需要复习!');
        return;
    }

    appState.currentItems = [...appState.wrongItems];
    appState.currentIndex = 0;
    appState.results = [];
    appState.wrongItems = [];
    appState.startTime = Date.now();
    appState.awaitingAnswer = false;

    startTimer();
    renderPracticeView();
}

/**
 * 退出练习
 */
function exitPractice() {
    if (confirm('确定要退出练习吗?进度将不会保存。')) {
        stopTimer();
        renderHomePage();
    }
}

/**
 * 开始计时
 */
function startTimer() {
    appState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - appState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            timerEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
        }
    }, 1000);
}

/**
 * 停止计时
 */
function stopTimer() {
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
        appState.timerInterval = null;
    }
}

// 添加必要的样式
const appStyles = `
<style>
.button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin: 20px 0;
}
.stats {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
    flex-wrap: wrap;
}
.stat-item {
    text-align: center;
    margin: 10px;
}
.stat-value {
    font-size: 36px;
    font-weight: bold;
    color: #667eea;
}
.stat-label {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
}
.progress-bar {
    width: 100%;
    height: 20px;
    background: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
    margin: 20px 0;
}
.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.5s;
}
.word-card {
    background: #f8f9ff;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    margin: 20px 0;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.word {
    font-size: 72px;
    font-weight: bold;
    color: #333;
    margin: 20px 0;
}
.pinyin {
    font-size: 36px;
    color: #667eea;
    margin: 15px 0;
}
.meaning {
    font-size: 20px;
    color: #666;
    margin: 15px 0;
    line-height: 1.6;
}
.action-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 30px;
    flex-wrap: wrap;
}
.btn-success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}
.btn-danger {
    background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
}
.btn-warning {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.new-badge {
    background: #ee0979;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    margin-left: 5px;
}
.mode-badge {
    display: inline-block;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    margin-left: 10px;
    background: #667eea;
    color: white;
}
.info-box {
    background: #f0f0f0;
    padding: 20px;
    border-radius: 10px;
    margin-top: 20px;
    text-align: center;
}
.info-box p {
    color: #666;
    margin: 5px 0;
    line-height: 1.6;
}
.lesson-selector {
    background: white;
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 20px;
}
.lesson-selector h3 {
    color: #667eea;
    margin-bottom: 15px;
    font-size: 18px;
}
.lesson-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
}
.lesson-btn {
    padding: 15px;
    background: white;
    border: 2px solid #e0e0e0;
    color: #333;
    font-size: 14px;
}
.lesson-btn:hover {
    border-color: #667eea;
    background: #f8f9ff;
}
.lesson-count {
    display: block;
    font-size: 12px;
    opacity: 0.8;
    margin-top: 5px;
}
.dictation-instruction {
    background: #fff3e0;
    border: 3px dashed #ff9800;
    border-radius: 15px;
    padding: 30px;
    margin: 20px 0;
}
.dictation-instruction h3 {
    color: #f57c00;
    font-size: 24px;
    margin-bottom: 15px;
}
.dictation-instruction p {
    color: #e65100;
    font-size: 18px;
    line-height: 1.8;
    margin: 10px 0;
}
.write-icon {
    font-size: 48px;
    margin: 15px 0;
}
</style>
`;

// 注入样式到head
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', appStyles);
}
