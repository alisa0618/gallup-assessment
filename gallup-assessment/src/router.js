import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import AssessmentView from './views/AssessmentView.vue'
import ResultsView from './views/ResultsView.vue'
import AdminView from './views/AdminView.vue'

const routes = [
  { path: '/', name: 'login', component: LoginView },
  { path: '/assessment', name: 'assessment', component: AssessmentView },
  { path: '/results', name: 'results', component: ResultsView },
  { path: '/admin', name: 'admin', component: AdminView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router