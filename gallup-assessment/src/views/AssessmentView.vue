<template>
  <div class="page-container assessment-page">
    <!-- Header -->
    <div class="assessment-header">
      <div class="progress-info">
        <span class="progress-text">{{ currentQ }} / 180</span>
        <span class="progress-pct">{{ Math.round((answeredCount / 180) * 100) }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (answeredCount / 180 * 100) + '%' }"></div>
      </div>
    </div>

    <!-- Question Card -->
    <transition name="slide" mode="out-in">
      <div class="card question-card" :key="currentQ" v-if="question">
        <div class="question-number">第 {{ currentQ }} 题</div>

        <div class="question-text">
          <div class="option-a">A. {{ question.a }}</div>
          <div class="option-b">B. {{ question.b }}</div>
        </div>

        <div class="answer-options">
          <button
            v-for="opt in options"
            :key="opt.value"
            :class="['answer-btn', { selected: answer === opt.value }, opt.cls]"
            @click="selectAnswer(opt.value)"
          >
            <span class="answer-label">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Navigation -->
    <div class="nav-buttons">
      <button class="btn-secondary" @click="prevQuestion" :disabled="currentQ <= 1">
        ← 上一题
      </button>
      <button
        v-if="currentQ < 180"
        class="btn-primary"
        @click="nextQuestion"
      >
        下一题 →
      </button>
      <button
        v-else
        class="btn-accent"
        @click="finishAssessment"
        :disabled="answeredCount < 180"
      >
        提交测评 ✓
      </button>
    </div>

    <div class="exit-link">
      <a href="#" @click.prevent="exitAssessment">退出测评</a>
    </div>

    <!-- Confirm Exit Modal -->
    <div v-if="showExitConfirm" class="modal-overlay" @click.self="showExitConfirm = false">
      <div class="modal-card">
        <p class="modal-text">确定要退出吗？已作答的题目会自动保存。</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showExitConfirm = false">继续作答</button>
          <button class="btn-primary" @click="confirmExit">退出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { questions } from '../data/questions.js'
import { getCurrentCode, getAnswer, saveAnswer, getAnsweredCount, getAnswers, saveResults, getCodeData } from '../utils/storage.js'
import { calculateScores } from '../utils/scoring.js'

const router = useRouter()
const currentQ = ref(1)
const answer = ref(null)
const code = ref('')
const showExitConfirm = ref(false)

const question = computed(() => questions[currentQ.value - 1])
const answeredCount = ref(0)

const options = [
  { value: 1, label: '特别同意 A', cls: 'opt-a-strong' },
  { value: 2, label: '比较同意 A', cls: 'opt-a' },
  { value: 3, label: '居中', cls: 'opt-center' },
  { value: 4, label: '比较同意 B', cls: 'opt-b' },
  { value: 5, label: '特别同意 B', cls: 'opt-b-strong' },
]

onMounted(() => {
  code.value = getCurrentCode()
  if (!code.value) {
    router.push('/')
    return
  }
  // Resume from where user left off - find first unanswered question
  const data = getCodeData(code.value)
  if (data && data.answers) {
    const answered = Object.keys(data.answers).map(Number)
    if (answered.length > 0) {
      // Find first unanswered question
      for (let i = 1; i <= 180; i++) {
        if (!data.answers[i]) {
          currentQ.value = i
          break
        }
        if (i === 180) currentQ.value = 180
      }
    }
  }
  loadQuestionState()
  updateAnsweredCount()
})

function loadQuestionState() {
  answer.value = getAnswer(code.value, currentQ.value)
}

function updateAnsweredCount() {
  answeredCount.value = getAnsweredCount(code.value)
}

function selectAnswer(val) {
  answer.value = val
  saveAnswer(code.value, currentQ.value, val)
  updateAnsweredCount()
  // Auto-advance after a short delay
  if (currentQ.value < 180) {
    setTimeout(() => {
      currentQ.value++
      loadQuestionState()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 300)
  }
}

function prevQuestion() {
  if (currentQ.value > 1) {
    currentQ.value--
    loadQuestionState()
  }
}

function nextQuestion() {
  if (currentQ.value < 180) {
    currentQ.value++
    loadQuestionState()
  }
}

function finishAssessment() {
  if (answeredCount.value < 180) return
  const answers = getAnswers(code.value)
  const results = calculateScores(answers)
  saveResults(code.value, results)
  router.push('/results')
}

function exitAssessment() {
  showExitConfirm.value = true
}

function confirmExit() {
  showExitConfirm.value = false
  router.push('/')
}
</script>

<style scoped>
.assessment-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.assessment-header {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.progress-pct {
  font-size: 14px;
  color: var(--primary);
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.question-card {
  flex: 1;
  margin-bottom: 20px;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.question-number {
  font-size: 13px;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 16px;
}

.question-text {
  margin-bottom: 24px;
}

.option-a, .option-b {
  font-size: 15px;
  line-height: 1.7;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}

.option-a {
  background: rgba(108, 142, 191, 0.06);
  border-left: 3px solid var(--primary);
}

.option-b {
  background: rgba(123, 198, 160, 0.06);
  border-left: 3px solid var(--accent);
}

.answer-options {
  display: flex;
  gap: 8px;
}

.answer-btn {
  flex: 1;
  min-width: 0;
  padding: 14px 6px;
  font-size: 13px;
  background: var(--bg);
  color: var(--text-light);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  transition: all 0.2s;
  line-height: 1.3;
}

.answer-btn:hover {
  border-color: var(--primary-light);
  color: var(--text);
}

.answer-btn.selected.opt-a-strong {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.answer-btn.selected.opt-a {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary-dark);
}

.answer-btn.selected.opt-center {
  background: var(--border);
  border-color: var(--text-light);
  color: var(--text);
}

.answer-btn.selected.opt-b {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent-dark);
}

.answer-btn.selected.opt-b-strong {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.nav-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.nav-buttons button {
  flex: 1;
  padding: 14px;
  font-size: 15px;
}

.exit-link {
  text-align: center;
  padding: 8px 0;
}

.exit-link a {
  font-size: 14px;
  color: var(--text-lighter);
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.15s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 400px) {
  .answer-options {
    gap: 4px;
  }
  .answer-btn {
    font-size: 12px;
    padding: 12px 2px;
  }
  .option-a, .option-b {
    font-size: 14px;
    padding: 10px 12px;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 24px;
  max-width: 360px;
  width: 100%;
  text-align: center;
}

.modal-text {
  font-size: 15px;
  color: var(--text);
  margin-bottom: 20px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-actions button {
  min-width: 100px;
}
</style>