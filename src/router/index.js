import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../views/Auth.vue';
import Budget from '../views/Budget.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth',
    },

    {
      path: '/auth',
      name: 'auth',
      component: Auth,
    },
    {
      path: '/budget',
      name: 'budget',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: Budget,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');
  if (to.meta.requiresAuth && (!token || token === 'undefined')) {
    next('/auth'); // Перенаправление на страницу авторизации
  } else {
    next();
  }
});

export default router;
