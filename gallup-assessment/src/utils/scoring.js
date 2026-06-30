import { scoringMap } from '../data/scoring.js'
import { themes } from '../data/themes.js'

// Answer encoding:
// 1 = 特别同意A (3pts A), 2 = 比较同意A (2pts A), 3 = 居中 (1pt center),
// 4 = 比较同意B (2pts B), 5 = 特别同意B (3pts B)

function getAnswerValues(answer) {
  switch (answer) {
    case 1: return { aVal: 3, centerVal: 0, bVal: 0 }
    case 2: return { aVal: 2, centerVal: 0, bVal: 0 }
    case 3: return { aVal: 0, centerVal: 1, bVal: 0 }
    case 4: return { aVal: 0, centerVal: 0, bVal: 2 }
    case 5: return { aVal: 0, centerVal: 0, bVal: 3 }
    default: return { aVal: 0, centerVal: 0, bVal: 0 }
  }
}

// Map column letter to answer value field
const colMap = { B: 'aVal', C: 'centerVal', D: 'bVal' }

export function calculateScores(answers) {
  const scores = new Array(34).fill(0)

  for (let q = 1; q <= 180; q++) {
    const rules = scoringMap[q]
    if (!rules) continue

    for (const rule of rules) {
      if (!answers[q]) continue

      let score = 0
      for (const token of rule.tokens) {
        const refAnswers = getAnswerValues(answers[token.refQ])
        const val = refAnswers[colMap[token.col]] || 0
        score += (token.op === '-' ? -val : val)
      }

      scores[rule.themeIndex] += score
    }
  }

  const results = themes.map((theme, i) => ({
    ...theme,
    score: scores[i],
    percentage: Math.round((scores[i] / theme.maxScore) * 100)
  }))

  const sorted = [...results].sort((a, b) => b.score - a.score || a.index - b.index)
  sorted.forEach((r, i) => { r.rank = i + 1 })

  return sorted
}

export function getTop5(results) {
  return results.slice(0, 5)
}

export function generateAISummary(top5) {
  const parts = top5.map((t, i) => {
    const ordinal = ['第一', '第二', '第三', '第四', '第五'][i]
    return `${ordinal}大优势「${t.name}」：${t.shortDesc}`
  })

  const top5Names = top5.map(t => t.name).join('、')
  return `你的前五大优势为：${top5Names}。\n\n${parts.join('\n\n')}\n\n这五大优势构成了你的核心才干组合，它们之间的协同作用将帮助你在工作与生活中发挥最大的潜力。建议你在职业发展和日常工作中，优先围绕这些优势来规划目标和行动策略。`
}