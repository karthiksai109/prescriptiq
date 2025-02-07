<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand-section">
          <div class="brand-logo">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0B6E4F"/>
              <path d="M16 6L16 26M6 16L26 16" stroke="white" stroke-width="3" stroke-linecap="round"/>
              <circle cx="16" cy="16" r="6" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            <h1>PrescriptiQ</h1>
          </div>
          <p class="brand-tagline">Intelligent Prescription Personalization Platform</p>
          <div class="features-list">
            <div class="feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6E4F" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>AI-Powered Prescription Personalization</span>
            </div>
            <div class="feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6E4F" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Real-time Patient Health Tracking</span>
            </div>
            <div class="feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6E4F" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Drug Interaction Safety Checks</span>
            </div>
            <div class="feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6E4F" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Weight Loss Progress Analytics</span>
            </div>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-container">
          <h2>Welcome Back</h2>
          <p class="login-subtitle">Sign in to your provider account</p>
          
          <div v-if="error" class="error-message">{{ error }}</div>
          
          <form aria-label="Login form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="label">Email Address</label>
              <input v-model="email" type="email" class="input-field" placeholder="sarah@prescriptiq.com" required />
            </div>
            <div class="form-group">
              <label class="label">Password</label>
              <input v-model="password" type="password" class="input-field" placeholder="Enter your password" required />
            </div>
            <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="demo-credentials">
            <p class="demo-title">Demo Credentials</p>
            <p class="demo-info">Email: <strong>sarah@prescriptiq.com</strong></p>
            <p class="demo-info">Password: <strong>demo123</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { useRouter } from 'vue-router';
import { LOGIN_MUTATION } from '../graphql/queries';

const router = useRouter();
const email = ref('sarah@prescriptiq.com');
const password = ref('demo123');
const error = ref('');
const loading = ref(false);

const { mutate: loginMutation } = useMutation(LOGIN_MUTATION);

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    const result = await loginMutation({ input: { email: email.value, password: password.value } });
    if (result?.data?.login) {
      const { token, provider } = result.data.login;
      localStorage.setItem('prescriptiq_token', token);
      localStorage.setItem('prescriptiq_provider_name', `${provider.first_name} ${provider.last_name}`);
      window.location.href = '/dashboard';
    }
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8faf9 0%, #e8f0ed 100%);
}

.login-container {
  display: flex;
  width: 900px;
  max-width: 95vw;
  min-height: 560px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 48px;
  display: flex;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.brand-logo h1 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.brand-tagline {
  font-size: 15px;
  opacity: 0.8;
  margin-bottom: 40px;
  line-height: 1.5;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.feature-item svg {
  stroke: rgba(255,255,255,0.8);
  flex-shrink: 0;
}

.login-right {
  flex: 1;
  background: white;
  padding: 48px;
  display: flex;
  align-items: center;
}

.login-form-container {
  width: 100%;
}

.login-form-container h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  margin-top: 8px;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background: rgba(199, 62, 29, 0.1);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 20px;
  border: 1px solid rgba(199, 62, 29, 0.2);
}

.demo-credentials {
  margin-top: 28px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.demo-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.demo-info {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.demo-info strong {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .login-left { display: none; }
  .login-container { width: 100%; max-width: 440px; }
}
</style>
