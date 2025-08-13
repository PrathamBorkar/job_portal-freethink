// src/router/routes.js

const routes = [
  {
    path: '/',
    component: () => import('layouts/RootLayout.vue'),
    children: [
      { path: '', name: 'index', component: () => import('pages/IndexPage.vue') },
      { path: 'login', name: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', name: 'register', component: () => import('pages/RegisterPage.vue') },
    ],
  },
  {
    path: '/applicant',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'applicant', component: () => import('pages/ApplicantPage.vue') },
      { path: 'jobs', name: 'jobs', component: () => import('pages/JobsPage.vue') },
    ],
  },
  {
    path: '/recruiter',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'recruiter', component: () => import('pages/RecruiterPage.vue') }],
  },
  {
    path: '/all-jobs',
    component: () => import('layouts/RootLayout.vue'),
    children: [{ path: '', name: 'applicant', component: () => import('pages/AllJobsPage.vue') }],
  },

  // Fallback for 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
