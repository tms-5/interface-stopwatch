import { createRouter, createWebHistory } from 'vue-router'
import TeamList from './views/TeamList.vue'
import TeamForm from './views/TeamForm.vue'
import Daily from './views/AgileDaily.vue'

const routes = [
  { path: '/', component: TeamList },
  { path: '/create', component: TeamForm },
  { path: '/edit/:teamName', component: TeamForm, props: true },
  { path: '/daily/:teamName', component: Daily, props: true },
  { path: '/invite', component: Daily, props: route => ({
  start: route.query.start,
  end: route.query.end,
  guests: route.query.guests
}) },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router