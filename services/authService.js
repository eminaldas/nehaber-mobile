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

export async function googleLogin(credential, termsAccepted = true) {
  // credential: Google OAuth access_token (backend /auth/google -> userinfo ile doğrular)
  const { data } = await api.post('/auth/google', { credential, terms_accepted: termsAccepted });
  return data; // { access_token, token_type, expires_in, user, is_new_user, needs_onboarding }
}

export async function getMe() {
  const { data } = await api.get('/users/me');
  return data; // UserResponse
}
