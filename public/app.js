// API 基础 URL
const API_BASE_URL = 'http://localhost:3000/api';

// 全局状态
let currentWords = [];
let currentIndex = 0;
let todayLearned = 0;
let learningRecords = [];

// DOM 元素
const startBtn = document.getElementById('startBtn');
const knowBtn = document.getElementById('knowBtn');
const dontKnowBtn = document.getElementById('dontKnowBtn');
const nextBtn = document.getElementById('nextBtn');
const currentWordEl = document.getElementById('currentWord');
const pinyinEl = document.getElementById('pinyin');
const meaningEl = document.getElementById('meaning');
const exampleEl = document.getElementById('example');
const recordsList = document.getElementById('recordsList');
const todayCountEl = document.getElementById('todayCount');
const totalWordsEl = document.getElementById('totalWords');
const masterRateEl = document.getElementById('masterRate');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const loadingEl = document.getElementById('loading');
const notificationEl = document.getElementById('notification');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    startBtn.addEventListener('click', startLearning);
    knowBtn.addEventListener('click', () => handleAnswer(true));
    dontKnowBtn.addEventListener('click', () => handleAnswer(false));
    nextBtn.addEventListener('click', showNextWord);

    loadStatistics();
});

// 显示加载动画
function showLoading(show = true) {
    loadingEl.style.display = show ? 'flex' : 'none';
}

// 显示通知
function showNotification(message, type = 'success') {
    notificationEl.textContent = message;
    notificationEl.className = `notification ${type} show`;
    setTimeout(() => {
        notificationEl.classList.remove('show');
    }, 3000);
}

// 开始学习
async function startLearning() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/words`);
        if (!response.ok) {
            throw new Error('获取生词失败');
        }

        const data = await response.json();
        currentWords = data.words;
        currentIndex = 0;

        if (currentWords.length === 0) {
            showNotification('没有可学习的生词', 'error');
            return;
        }

        startBtn.style.display = 'none';
        showCurrentWord();
        showNotification(`成功加载 ${currentWords.length} 个生词！`);

    } catch (error) {
        console.error('Error:', error);
        showNotification('连接服务器失败，请检查配置', 'error');
    } finally {
        showLoading(false);
    }
}

// 显示当前单词
function showCurrentWord() {
    if (currentIndex >= currentWords.length) {
        showCompletion();
        return;
    }

    const word = currentWords[currentIndex];
    currentWordEl.textContent = word.word;
    pinyinEl.textContent = '';
    meaningEl.textContent = '';
    exampleEl.textContent = '';

    knowBtn.style.display = 'inline-block';
    dontKnowBtn.style.display = 'inline-block';
    nextBtn.style.display = 'none';

    updateProgress();
}

// 处理回答
async function handleAnswer(know) {
    const word = currentWords[currentIndex];

    // 显示详细信息
    pinyinEl.textContent = word.pinyin || '';
    meaningEl.textContent = word.meaning || '';
    exampleEl.textContent = word.example || '';

    knowBtn.style.display = 'none';
    dontKnowBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';

    todayLearned++;
    todayCountEl.textContent = todayLearned;

    // 保存学习记录
    const record = {
        word: word.word,
        pinyin: word.pinyin,
        meaning: word.meaning,
        know: know,
        timestamp: new Date().toISOString()
    };

    learningRecords.unshift(record);
    addRecordToList(record);

    // 发送到后端保存到 Notion
    try {
        await fetch(`${API_BASE_URL}/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
    } catch (error) {
        console.error('保存记录失败:', error);
    }

    updateStatistics();
}

// 显示下一个单词
function showNextWord() {
    currentIndex++;
    if (currentIndex >= currentWords.length) {
        showCompletion();
    } else {
        showCurrentWord();
    }
}

// 显示完成信息
function showCompletion() {
    currentWordEl.textContent = '🎉 恭喜完成！';
    pinyinEl.textContent = '';
    meaningEl.textContent = `今天学习了 ${todayLearned} 个生词`;
    exampleEl.textContent = '继续加油！';

    knowBtn.style.display = 'none';
    dontKnowBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    startBtn.textContent = '再来一轮';

    showNotification('完成本轮学习！', 'success');
}

// 添加记录到列表
function addRecordToList(record) {
    if (recordsList.querySelector('.empty-message')) {
        recordsList.innerHTML = '';
    }

    const recordItem = document.createElement('div');
    recordItem.className = 'record-item';

    const statusText = record.know ? '认识 ✓' : '不认识 ×';
    const statusClass = record.know ? 'know' : 'dont-know';
    const time = new Date(record.timestamp).toLocaleTimeString('zh-CN');

    recordItem.innerHTML = `
        <div class="word">${record.word} ${record.pinyin ? `(${record.pinyin})` : ''}</div>
        <div class="status ${statusClass}">${statusText}</div>
        <div class="time">${time}</div>
    `;

    recordsList.insertBefore(recordItem, recordsList.firstChild);
}

// 更新进度
function updateProgress() {
    const total = currentWords.length;
    const current = currentIndex;
    const percentage = total > 0 ? (current / total * 100) : 0;

    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${current} / ${total}`;
}

// 更新统计信息
function updateStatistics() {
    totalWordsEl.textContent = currentWords.length;

    const knownWords = learningRecords.filter(r => r.know).length;
    const totalLearned = learningRecords.length;
    const masterRate = totalLearned > 0 ? Math.round((knownWords / totalLearned) * 100) : 0;

    masterRateEl.textContent = `${masterRate}%`;
}

// 加载统计信息
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/statistics`);
        if (response.ok) {
            const stats = await response.json();
            todayCountEl.textContent = stats.todayCount || 0;
            totalWordsEl.textContent = stats.totalWords || 0;
            masterRateEl.textContent = `${stats.masterRate || 0}%`;
        }
    } catch (error) {
        console.error('加载统计信息失败:', error);
    }
}
