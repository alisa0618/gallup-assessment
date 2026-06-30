<template>
  <div class="page-container login-page">
    <div class="login-header">
      <div class="logo-icon">✦</div>
      <h1>盖洛普优势识别器</h1>
      <p class="subtitle">发现你的核心优势，释放内在潜能</p>
    </div>

    <div class="card login-card">
      <div class="tab-bar">
        <button :class="['tab-btn', { active: tab === 'code' }]" @click="tab = 'code'">测评码登录</button>
        <button :class="['tab-btn', { active: tab === 'admin' }]" @click="tab = 'admin'">管理员登录</button>
      </div>

      <div v-if="tab === 'code'" class="tab-content">
        <div class="form-group">
          <label>测评码</label>
          <input v-model="code" placeholder="请输入测评码" @keyup.enter="handleCodeLogin" />
        </div>
        <button class="btn-primary login-btn" @click="handleCodeLogin" :disabled="!code.trim()">
          开始测评
        </button>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>

      <div v-if="tab === 'admin'" class="tab-content">
        <div class="form-group">
          <label>管理员密码</label>
          <input v-model="password" type="password" placeholder="请输入管理员密码" @keyup.enter="handleAdminLogin" />
        </div>
        <button class="btn-primary login-btn" @click="handleAdminLogin" :disabled="!password.trim()">
          登录管理后台
        </button>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>
    </div>

    <div class="login-footer">
      <p>共 180 道题目 · 约 30-40 分钟完成</p>
      <p class="hint">内置永久测评码：ADMIN001 / ADMIN002 / ADMIN003</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCodeData, adminLogin, setAdminAuth, setCurrentCode, isAssessmentComplete } from '../utils/storage.js'

const router = useRouter()
const tab = ref('code')
const code = ref('')
const password = ref('')
const error = ref('')

function handleCodeLogin() {
  error.value = ''
  const c = code.value.trim().toUpperCase()
  if (!c) { error.value = '请输入测评码'; return }

  const data = getCodeData(c)
  if (!data) { error.value = '测评码不存在，请确认后重试'; return }

  setCurrentCode(c)
  if (isAssessmentComplete(c)) {
    router.push('/results')
  } else {
    router.push('/assessment')
  }
}

function handleAdminLogin() {
  error.value = ''
  if (adminLogin(password.value)) {
    setAdminAuth(true)
    router.push('/admin')
  } else {
    error.value = '密码错误'
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px 16px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  color: var(--primary);
  margin-bottom: 12px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-light);
  font-size: 15px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  color: var(--text-light);
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s;
}
.tab-btn.active {
  background: #fff;
  color: var(--primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: var(--radius-sm);
}

.error-msg {
  color: #e53e3e;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--text-lighter);
  font-size: 13px;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--accent-dark);
}
</style>