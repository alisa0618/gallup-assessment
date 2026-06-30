<template>
  <div class="page-container admin-page">
    <div class="admin-header">
      <h1>测评管理后台</h1>
      <button class="btn-secondary" @click="logout">退出登录</button>
    </div>

    <!-- Permanent Codes Info -->
    <div class="card info-card">
      <h2>永久测评码</h2>
      <p class="info-text">以下测评码不限次数使用，可反复测评：</p>
      <div class="perm-codes">
        <div v-for="pc in permanentCodes" :key="pc" class="perm-code-row">
          <span class="perm-code-text">{{ pc }}</span>
          <button class="copy-btn" @click="copyCode(pc)" title="复制">📋</button>
        </div>
      </div>
    </div>

    <!-- Generate Code -->
    <div class="card gen-card">
      <h2>生成测评码</h2>
      <div class="gen-form">
        <input v-model="newName" placeholder="输入测评人姓名" @keyup.enter="generateNewCode" />
        <button class="btn-primary" @click="generateNewCode" :disabled="!newName.trim()">生成</button>
      </div>
      <p v-if="lastGenerated" class="gen-result">已生成测评码：<strong>{{ lastGenerated }}</strong></p>
    </div>

    <!-- Codes List -->
    <div class="card list-card">
      <h2>测评码列表 <span class="count">({{ codesList.length }})</span></h2>

      <div class="filter-bar">
        <button :class="['filter-btn', { active: filter === 'all' }]" @click="filter = 'all'">全部</button>
        <button :class="['filter-btn', { active: filter === 'unused' }]" @click="filter = 'unused'">未使用</button>
        <button :class="['filter-btn', { active: filter === 'in_progress' }]" @click="filter = 'in_progress'">进行中</button>
        <button :class="['filter-btn', { active: filter === 'completed' }]" @click="filter = 'completed'">已完成</button>
      </div>

      <div class="codes-list">
        <div v-for="item in filteredCodes" :key="item.code" class="code-row">
          <div class="code-info">
            <div class="code-value">
              <span class="code-text">{{ item.code }}</span>
              <button class="copy-btn" @click="copyCode(item.code)" title="复制">📋</button>
            </div>
            <div class="code-meta">
              <span class="code-name">{{ item.name }}</span>
              <span :class="['status-badge', item.status]">{{ statusLabel(item.status) }}</span>
            </div>
          </div>
        </div>
        <div v-if="filteredCodes.length === 0" class="empty-msg">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isAdminAuth, setAdminAuth, generateCode, getCodesList } from '../utils/storage.js'

const router = useRouter()
const newName = ref('')
const filter = ref('all')
const codesList = ref([])
const lastGenerated = ref('')
const permanentCodes = ['ADMIN001', 'ADMIN002', 'ADMIN003']

const filteredCodes = computed(() => {
  if (filter.value === 'all') return codesList.value
  return codesList.value.filter(c => c.status === filter.value)
})

onMounted(() => {
  if (!isAdminAuth()) {
    router.push('/')
    return
  }
  refreshList()
})

function refreshList() {
  codesList.value = getCodesList()
}

function generateNewCode() {
  const name = newName.value.trim()
  if (!name) return
  const code = generateCode(name)
  lastGenerated.value = code
  newName.value = ''
  refreshList()
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    alert('已复制: ' + code)
  }).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    alert('已复制: ' + code)
  })
}

function statusLabel(status) {
  const map = { unused: '未使用', in_progress: '进行中', completed: '已完成', permanent: '永久' }
  return map[status] || status
}

function logout() {
  setAdminAuth(false)
  router.push('/')
}
</script>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.admin-header h1 {
  font-size: 22px;
  font-weight: 600;
}

.info-card {
  margin-bottom: 20px;
}

.info-card h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.info-text {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 12px;
}

.perm-codes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.perm-code-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(123, 198, 160, 0.08);
  border: 1px solid var(--accent-light);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
}

.perm-code-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-dark);
}

.gen-card {
  margin-bottom: 20px;
}

.gen-card h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.gen-result {
  margin-top: 12px;
  font-size: 14px;
  color: var(--accent-dark);
}

.gen-result strong {
  font-family: 'SF Mono', 'Menlo', monospace;
}

.gen-form {
  display: flex;
  gap: 12px;
}

.gen-form input {
  flex: 1;
}

.gen-form button {
  white-space: nowrap;
}

.list-card h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.count {
  font-size: 14px;
  color: var(--text-lighter);
  font-weight: 400;
}

.filter-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 14px;
  font-size: 13px;
  background: var(--bg);
  color: var(--text-light);
  border: 1px solid var(--border);
  border-radius: 20px;
}

.filter-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.codes-list {
  max-height: 60vh;
  overflow-y: auto;
}

.code-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.code-row:last-child {
  border-bottom: none;
}

.code-value {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.code-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-dark);
}

.copy-btn {
  background: none;
  border: none;
  font-size: 16px;
  padding: 2px 6px;
  cursor: pointer;
  opacity: 0.6;
}
.copy-btn:hover {
  opacity: 1;
}

.code-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-name {
  font-size: 14px;
  color: var(--text);
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.status-badge.unused {
  background: #EBF5FF;
  color: #3182CE;
}

.status-badge.in_progress {
  background: #FEFCBF;
  color: #B7791F;
}

.status-badge.completed {
  background: #F0FFF4;
  color: #38A169;
}

.status-badge.permanent {
  background: #FAF5FF;
  color: #805AD5;
}

.empty-msg {
  text-align: center;
  color: var(--text-lighter);
  padding: 32px 0;
  font-size: 14px;
}
</style>