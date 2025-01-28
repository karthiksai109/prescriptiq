import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/patients',
    name: 'Patients',
    component: () => import('../views/PatientsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/patients/:id',
    name: 'PatientDetail',
    component: () => import('../views/PatientDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/prescriptions',
    name: 'Prescriptions',
    component: () => import('../views/PrescriptionsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/personalize',
    name: 'Personalize',
    component: () => import('../views/PersonalizeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/medications',
    name: 'Medications',
    component: () => import('../views/MedicationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('prescriptiq_token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/dashboard');
  } else {
    next();
  }
});
