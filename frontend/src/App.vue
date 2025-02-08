<template>
  <div id="app" :class="{ 'sidebar-open': sidebarOpen }">
    <template v-if="isAuthenticated">
      <nav class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0B6E4F"/>
              <path d="M16 6L16 26M6 16L26 16" stroke="white" stroke-width="3" stroke-linecap="round"/>
              <circle cx="16" cy="16" r="6" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            <span class="logo-text">PrescriptiQ</span>
          </div>
          <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <ul class="nav-links">
          <li>
            <router-link to="/dashboard" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <span>Dashboard</span>
            </router-link>
          </li>
          <li>
            <router-link to="/patients" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Patients</span>
            </router-link>
          </li>
          <li>
            <router-link to="/prescriptions" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
              <span>Prescriptions</span>
            </router-link>
          </li>
          <li>
            <router-link to="/personalize" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span>Personalize Rx</span>
            </router-link>
          </li>
          <li>
            <router-link to="/medications" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3"/></svg>
              <span>Medications</span>
            </router-link>
          </li>
        </ul>
        <div class="sidebar-footer">
          <div class="provider-info" v-if="providerName">
            <div class="avatar">{{ providerInitials }}</div>
            <div class="provider-details">
              <span class="provider-name">{{ providerName }}</span>
              <span class="provider-role">Provider</span>
            </div>
          </div>
          <button class="logout-btn" @click="logout">Sign Out</button>
        </div>
      </nav>
      <main class="main-content">
        <router-view />
      </main>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(true);

const isAuthenticated = computed(() => !!localStorage.getItem('prescriptiq_token'));
const providerName = computed(() => localStorage.getItem('prescriptiq_provider_name') || '');
const providerInitials = computed(() => {
  const name = providerName.value;
  if (!name) return '';
  return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
});

function logout() {
  localStorage.removeItem('prescriptiq_token');
  localStorage.removeItem('prescriptiq_provider_name');
  router.push('/login');
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #0B6E4F;
  --primary-light: #14A76C;
  --primary-dark: #084C37;
  --secondary: #1B4332;
  --accent: #2D6A4F;
  --bg-primary: #F8FAF9;
  --bg-secondary: #FFFFFF;
  --bg-card: #FFFFFF;
  --text-primary: #1A1D1F;
  --text-secondary: #6F767E;
  --text-muted: #9A9FA5;
  --border: #E6E8EC;
  --border-light: #F0F2F4;
  --success: #0B6E4F;
  --warning: #E8A317;
  --danger: #C73E1D;
  --info: #2C698D;
  --sidebar-width: 260px;
  --sidebar-collapsed: 72px;
  --header-height: 64px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

#app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-width);
  background: var(--secondary);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  transition: width 0.3s ease;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 4px;
}

.nav-links {
  list-style: none;
  padding: 16px 12px;
  flex: 1;
}

.nav-links li {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.nav-link.active {
  background: var(--primary);
  color: white;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.provider-details {
  display: flex;
  flex-direction: column;
}

.provider-name {
  font-size: 13px;
  font-weight: 600;
}

.provider-role {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}

.logout-btn {
  width: 100%;
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.8);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.2);
  color: white;
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 32px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

/* Utility classes */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--border-light);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.input-field {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(11, 110, 79, 0.1);
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: rgba(11, 110, 79, 0.1);
  color: var(--success);
}

.badge-warning {
  background: rgba(232, 163, 23, 0.1);
  color: var(--warning);
}

.badge-danger {
  background: rgba(199, 62, 29, 0.1);
  color: var(--danger);
}

.badge-info {
  background: rgba(44, 105, 141, 0.1);
  color: var(--info);
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  .sidebar { transform: translateX(-100%); }
  .sidebar-open .sidebar { transform: translateX(0); }
  .main-content { margin-left: 0; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
