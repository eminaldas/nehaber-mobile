import api from './api';

export async function login(email, password) {
  // FastAPI OAuth2PasswordRequestForm — form-data formatı gerekiyor
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);
  const { data } = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { access_token, token_type, expires_in }
}

export async function register(payload) {
  // payload: { email, username, password, terms_accepted }
  const { data } = await api.post('/auth/register', payload);
  return data; // { access_token, token_type, expires_in, user, needs_verification, needs_onboarding }
}

export async function updateProfile(payload) {
  // payload: { username?, bio?, avatar_url?, social_links?, current_password?, new_password? }
  const { data } = await api.patch('/auth/me', payload);
  return data; // UserResponse
}

export async function deleteAccount(password) {
  const { data } = await api.delete('/auth/me', { data: { password } });
  return data;
}

export async function completeOnboarding(payload) {
  // payload: { interests: string[], marketing_source?, avatar_url?, username? }
  const { data } = await api.put('/auth/complete-onboarding', payload);
  return data; // UserResponse
}

export async function googleLogin(credential, termsAccepted = true) {
  // credential: Google OAuth access_token (backend /auth/google -> userinfo ile doğrular)
  const { data } = await api.post('/auth/google', { credential, terms_accepted: termsAccepted });
  return data; // { access_token, token_type, expires_in, user, is_new_user, needs_onboarding }
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data; // UserResponse
}

export async function refresh() {
  // Mevcut GEÇERLİ token ile yeni 30 dk'lık token üretir (proaktif yenileme).
  // Süresi dolmuş token ile çağrılırsa backend 401 döner.
  const { data } = await api.post('/auth/refresh');
  return data; // { access_token, token_type, expires_in }
}

// ─── 6 haneli kod tabanlı akışlar (mobil) ───

export async function sendPasswordResetCode(email) {
  const { data } = await api.post('/auth/password/send-code', { email });
  return data; // { message, dev_code? }
}

export async function resetPasswordWithCode(email, code, newPassword) {
  const { data } = await api.post('/auth/password/reset-with-code', {
    email,
    code,
    new_password: newPassword,
  });
  return data; // { message }
}

export async function sendEmailVerifyCode() {
  const { data } = await api.post('/auth/email/send-code');
  return data; // { detail, dev_code? }
}

export async function verifyEmailWithCode(code) {
  const { data } = await api.post('/auth/email/verify-code', { code });
  return data; // UserResponse (is_email_verified: true)
}
