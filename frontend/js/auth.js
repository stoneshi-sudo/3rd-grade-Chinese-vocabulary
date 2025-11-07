/**
 * 认证模块
 * 处理用户登录、注册和会话管理
 */

// 全局状态
let currentUser = null;
let authToken = null;

/**
 * 切换登录/注册标签
 */
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabButtons = document.querySelectorAll('.tab-btn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabButtons[0].classList.add('active');
        tabButtons[1].classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabButtons[0].classList.remove('active');
        tabButtons[1].classList.add('active');
    }

    clearMessages();
}

/**
 * 显示错误消息
 */
function showError(message) {
    const container = document.getElementById('error-container');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}

/**
 * 显示成功消息
 */
function showSuccess(message) {
    const container = document.getElementById('success-container');
    container.innerHTML = `<div class="success-message">${message}</div>`;
}

/**
 * 清除消息
 */
function clearMessages() {
    document.getElementById('error-container').innerHTML = '';
    document.getElementById('success-container').innerHTML = '';
}

/**
 * API请求封装
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };

    // 如果有token,添加到header
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `请求失败: ${response.status}`);
    }

    return data;
}

/**
 * 用户注册
 */
async function handleRegister(event) {
    event.preventDefault();
    clearMessages();

    const username = document.getElementById('register-username').value.trim();
    const displayName = document.getElementById('register-displayname').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // 验证
    if (password !== confirmPassword) {
        showError('两次输入的密码不一致');
        return;
    }

    if (password.length < 6) {
        showError('密码至少需要6个字符');
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showError('用户名只能包含字母、数字和下划线');
        return;
    }

    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '注册中...';

        await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, displayName, password })
        });

        showSuccess('注册成功!请登录');

        // 切换到登录标签
        setTimeout(() => {
            switchAuthTab('login');
            document.getElementById('login-username').value = username;
        }, 1500);

    } catch (error) {
        showError(error.message);
    } finally {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = '注册';
    }
}

/**
 * 用户登录
 */
async function handleLogin(event) {
    event.preventDefault();
    clearMessages();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '登录中...';

        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        // 保存token和用户信息
        authToken = data.token;
        currentUser = data.user;

        // 保存到localStorage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // 显示应用主界面
        showApp();

    } catch (error) {
        showError(error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '登录';
    }
}

/**
 * 用户登出
 */
async function logout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // 清除本地数据
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');

        // 显示登录页面
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('app-container').innerHTML = '';
    }
}

/**
 * 检查已登录状态
 */
async function checkAuth() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);

        try {
            // 验证token是否仍然有效
            const userData = await apiRequest('/auth/me');
            currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // 显示应用
            showApp();
        } catch (error) {
            console.error('Auth check failed:', error);
            // Token无效,清除并显示登录页
            logout();
        }
    }
}

/**
 * 显示应用主界面
 */
function showApp() {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    // 初始化应用(在app.js中定义)
    if (typeof initApp === 'function') {
        initApp();
    }
}

/**
 * 页面加载时初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    // 绑定表单事件
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // 检查登录状态
    checkAuth();
});
