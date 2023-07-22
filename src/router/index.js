import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/boards/free/list/',
    name: 'ListView',
    component: () => import(/* webpackChunkName: "boards" */ '../views/ListView.vue'),
  },
  {
    path: '/boards/free/view/:boardId',
    name: 'InfoView',
    component: () => import(/* webpackChunkName: "boards" */ '../views/InfoView.vue')
  },
  {
    path: '/board/free/write/',
    name: 'WriteView',
    component: () => import(/* webpackChunkName: "boards" */ '../views/WriteView.vue')
  },
  {
    path: '/board/free/modify',
    name: 'ModifyView',
    component: () => import(/* webpackChunkName: "boards" */ '../views/ModifyView.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
