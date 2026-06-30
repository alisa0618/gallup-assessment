// localStorage wrapper for assessment codes, answers, results
const PREFIX = 'gallup_'

const KEYS = {
  CODES: PREFIX + 'codes',
  ADMIN_AUTH: PREFIX + 'admin_auth',
  CURRENT_CODE: PREFIX + 'current_code',
}

// ===== Assessment Code Management =====
export function getAllCodes() {
  const raw = localStorage.getItem(KEYS.CODES)
  return raw ? JSON.parse(raw) : {}
}

function saveAllCodes(codes) {
  localStorage.setItem(KEYS.CODES, JSON.stringify(codes))
}

// 3 permanent admin codes
const PERMANENT_CODES = {
  'ADMIN001': { name: '永久测评码1', status: 'permanent', answers: {}, currentQ: 0, results: null, createdAt: 1 },
  'ADMIN002': { name: '永久测评码2', status: 'permanent', answers: {}, currentQ: 0, results: null, createdAt: 2 },
  'ADMIN003': { name: '永久测评码3', status: 'permanent', answers: {}, currentQ: 0, results: null, createdAt: 3 },
}

export function initPermanentCodes() {
  const codes = getAllCodes()
  for (const [code, data] of Object.entries(PERMANENT_CODES)) {
    if (!codes[code]) {
      codes[code] = { ...data }
    }
  }
  saveAllCodes(codes)
}

export function generateCode(name) {
  const codes = getAllCodes()
  const code = 'GL' + Math.random().toString(36).substring(2, 8).toUpperCase()
  codes[code] = {
    name,
    status: 'unused',
    answers: {},
    currentQ: 0,
    results: null,
    createdAt: Date.now()
  }
  saveAllCodes(codes)
  return code
}

export function getCodeData(code) {
  const codes = getAllCodes()
  return codes[code] || null
}

export function updateCodeData(code, data) {
  const codes = getAllCodes()
  if (codes[code]) {
    codes[code] = { ...codes[code], ...data }
    saveAllCodes(codes)
  }
}

export function getCodesList() {
  const codes = getAllCodes()
  return Object.entries(codes).map(([code, data]) => ({
    code,
    ...data
  })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

// ===== Answer Management =====
export function saveAnswer(code, questionNo, answer) {
  const codes = getAllCodes()
  if (codes[code]) {
    codes[code].answers[questionNo] = answer
    codes[code].currentQ = Math.max(codes[code].currentQ || 0, questionNo)
    if (codes[code].status === 'unused') {
      codes[code].status = 'in_progress'
    }
    saveAllCodes(codes)
  }
}

export function getAnswers(code) {
  const data = getCodeData(code)
  return data ? data.answers : {}
}

export function getAnswer(code, questionNo) {
  const answers = getAnswers(code)
  return answers[questionNo] || null
}

export function getCurrentQuestion(code) {
  const data = getCodeData(code)
  if (!data) return 0
  const answers = data.answers || {}
  for (let i = 1; i <= 180; i++) {
    if (!answers[i]) return i
  }
  return 180
}

export function getAnsweredCount(code) {
  const data = getCodeData(code)
  return data ? Object.keys(data.answers || {}).length : 0
}

// ===== Results Management =====
export function saveResults(code, results) {
  const codes = getAllCodes()
  if (codes[code]) {
    codes[code].results = results
    codes[code].status = codes[code].status === 'permanent' ? 'permanent' : 'completed'
    saveAllCodes(codes)
  }
}

export function getResults(code) {
  const data = getCodeData(code)
  return data ? data.results : null
}

export function isAssessmentComplete(code) {
  const data = getCodeData(code)
  if (!data) return false
  return data.status === 'completed' || (data.status === 'permanent' && data.results)
}

export function isPermanentCode(code) {
  const data = getCodeData(code)
  return data && data.status === 'permanent'
}

export function resetAssessment(code) {
  const codes = getAllCodes()
  if (codes[code]) {
    codes[code].answers = {}
    codes[code].currentQ = 0
    codes[code].results = null
    // keep status as 'permanent' for permanent codes, otherwise reset to 'unused'
    if (codes[code].status !== 'permanent') {
      codes[code].status = 'unused'
    }
    saveAllCodes(codes)
  }
}

// ===== Admin Auth =====
const ADMIN_PASSWORD = 'gallup2024'

export function adminLogin(password) {
  return password === ADMIN_PASSWORD
}

export function setAdminAuth(val) {
  localStorage.setItem(KEYS.ADMIN_AUTH, val ? '1' : '')
}

export function isAdminAuth() {
  return localStorage.getItem(KEYS.ADMIN_AUTH) === '1'
}

// ===== Current Code Session =====
export function setCurrentCode(code) {
  localStorage.setItem(KEYS.CURRENT_CODE, code)
}

export function getCurrentCode() {
  return localStorage.getItem(KEYS.CURRENT_CODE) || ''
}

export function clearCurrentCode() {
  localStorage.removeItem(KEYS.CURRENT_CODE)
}