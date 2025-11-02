import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/session',
      name: 'active-session',
      component: () => import('../views/ActiveSessionView.vue'),
    },
    {
      path: '/sessions',
      name: 'sessions-list',
      component: () => import('../views/SessionsListView.vue'),
    },
    {
      path: '/session/:id',
      name: 'session-details',
      component: () => import('../views/SessionDetailsView.vue'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/CalendarView.vue'),
    },
  ],
})

export default router
