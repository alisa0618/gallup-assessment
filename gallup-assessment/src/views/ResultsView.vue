<template>
  <div class="results-page">
    <!-- Header -->
    <div class="results-header">
      <div class="results-badge">✦</div>
      <h1 class="results-title">你的 Top 5 核心优势</h1>
      <p class="results-subtitle">基于盖洛普优势识别器 180 题测评结果</p>
    </div>

    <!-- Top5 Horizontal Visual -->
    <div class="top5-section">
      <div class="top5-track">
        <div v-for="(item, idx) in top5" :key="item.name" class="top5-item" :style="{ animationDelay: idx * 0.12 + 's' }">
          <div class="top5-medal">{{ item.rank }}</div>
          <div class="top5-content">
            <div class="top5-name">{{ item.name }}</div>
            <div class="top5-bar-wrap">
              <div class="top5-bar" :style="{ width: item.percentage + '%' }"></div>
            </div>
            <div class="top5-pct">{{ item.percentage }}%</div>
          </div>
          <div class="top5-desc">{{ item.shortDesc }}</div>
        </div>
      </div>
    </div>

    <!-- AI Summary -->
    <div class="card ai-summary-card">
      <div class="ai-header">✨ AI 优势概要</div>
      <div class="ai-body">
        <p v-for="(line, i) in summaryLines" :key="i">{{ line }}</p>
      </div>
    </div>

    <!-- Full 34 Ranking -->
    <div class="card ranking-card">
      <h2 class="ranking-title">全部 34 项优势排名</h2>
      <div class="ranking-grid">
        <div class="ranking-col">
          <div v-for="item in leftRanking" :key="item.name" class="ranking-row">
            <span class="ranking-num">{{ item.rank }}</span>
            <span class="ranking-name">{{ item.name }}</span>
          </div>
        </div>
        <div class="ranking-col">
          <div v-for="item in rightRanking" :key="item.name" class="ranking-row">
            <span class="ranking-num">{{ item.rank }}</span>
            <span class="ranking-name">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="results-actions">
      <button v-if="isPermanent" class="btn-accent" @click="retakeAssessment">重新测评</button>
      <button class="btn-secondary" @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentCode, getResults, clearCurrentCode, getAnswers, isPermanentCode, resetAssessment, saveResults } from '../utils/storage.js'
import { calculateScores, getTop5, generateAISummary } from '../utils/scoring.js'

const router = useRouter()
const results = ref([])
const isPermanent = ref(false)
const top5 = computed(() => results.value.slice(0, 5))
const summaryLines = computed(() => {
  const summary = generateAISummary(top5.value)
  return summary.split('\n').filter(l => l.trim())
})

const leftRanking = computed(() => results.value.slice(0, 10))
const rightRanking = computed(() => results.value.slice(10))

onMounted(() => {
  const code = getCurrentCode()
  if (!code) { router.push('/'); return }

  isPermanent.value = isPermanentCode(code)

  let res = getResults(code)
  if (!res) {
    const answers = getAnswers(code)
    if (Object.keys(answers).length === 180) {
      res = calculateScores(answers)
      saveResults(code, res)
    } else {
      router.push('/assessment')
      return
    }
  }
  results.value = res
})

function goHome() {
  clearCurrentCode()
  router.push('/')
}

function retakeAssessment() {
  const code = getCurrentCode()
  if (code) {
    resetAssessment(code)
  }
  router.push('/assessment')
}
</script>

<style scoped>
.results-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

/* Header */
.results-header {
  text-align: center;
  margin-bottom: 32px;
}

.results-badge {
  font-size: 40px;
  color: var(--primary);
  margin-bottom: 8px;
}

.results-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.results-subtitle {
  font-size: 14px;
  color: var(--text-light);
}

/* Top5 Horizontal Track */
.top5-section {
  margin-bottom: 28px;
}

.top5-track {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top5-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px 18px;
  animation: slideInRight 0.5s ease both;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}

.top5-medal {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.top5-item:nth-child(1) .top5-medal { background: linear-gradient(135deg, #6C8EBF, #4A6FA5); }
.top5-item:nth-child(2) .top5-medal { background: linear-gradient(135deg, #7BC6A0, #4FA87A); }
.top5-item:nth-child(3) .top5-medal { background: linear-gradient(135deg, #E8A87C, #D4845A); }
.top5-item:nth-child(4) .top5-medal { background: linear-gradient(135deg, #C4A7E7, #9B7FCF); }
.top5-item:nth-child(5) .top5-medal { background: linear-gradient(135deg, #7EB8D4, #5A98B8); }

.top5-content {
  flex: 1;
  min-width: 0;
}

.top5-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.top5-bar-wrap {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  margin-bottom: 4px;
  overflow: hidden;
}

.top5-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.top5-pct {
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
}

.top5-desc {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.5;
  flex-shrink: 0;
  align-self: center;
  max-width: 160px;
  display: none;
}

@media (min-width: 640px) {
  .top5-desc {
    display: block;
  }
}

/* AI Summary */
.ai-summary-card {
  margin-bottom: 24px;
}

.ai-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 12px;
}

.ai-body p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text);
  margin-bottom: 8px;
}

/* Full Ranking */
.ranking-card {
  margin-bottom: 24px;
}

.ranking-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}

.ranking-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

.ranking-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.ranking-num {
  width: 28px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  flex-shrink: 0;
}

.ranking-name {
  font-size: 14px;
  color: var(--text);
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0 32px;
}

@media (max-width: 520px) {
  .top5-item {
    padding: 12px 14px;
    gap: 10px;
  }
  .top5-medal {
    width: 34px;
    height: 34px;
    font-size: 15px;
  }
  .top5-name { font-size: 15px; }
  .ranking-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
