jest.mock('./api', () => ({ __esModule: true, default: { post: jest.fn(), patch: jest.fn(), delete: jest.fn(), get: jest.fn() } }));
import api from './api';
import {
  refresh,
  sendPasswordResetCode,
  resetPasswordWithCode,
  sendEmailVerifyCode,
  verifyEmailWithCode,
} from './authService';

beforeEach(() => jest.clearAllMocks());

test('refresh /auth/refresh çağırır ve data döner', async () => {
  api.post.mockResolvedValue({ data: { access_token: 'new', expires_in: 1800 } });
  const r = await refresh();
  expect(api.post).toHaveBeenCalledWith('/auth/refresh');
  expect(r).toEqual({ access_token: 'new', expires_in: 1800 });
});

test('sendPasswordResetCode email body gönderir', async () => {
  api.post.mockResolvedValue({ data: { message: 'ok' } });
  await sendPasswordResetCode('a@b.com');
  expect(api.post).toHaveBeenCalledWith('/auth/password/send-code', { email: 'a@b.com' });
});

test('resetPasswordWithCode snake_case new_password gönderir', async () => {
  api.post.mockResolvedValue({ data: { message: 'ok' } });
  await resetPasswordWithCode('a@b.com', '123456', 'sifre123');
  expect(api.post).toHaveBeenCalledWith('/auth/password/reset-with-code', {
    email: 'a@b.com',
    code: '123456',
    new_password: 'sifre123',
  });
});

test('sendEmailVerifyCode body olmadan çağrılır', async () => {
  api.post.mockResolvedValue({ data: { detail: 'ok' } });
  await sendEmailVerifyCode();
  expect(api.post).toHaveBeenCalledWith('/auth/email/send-code');
});

test('verifyEmailWithCode kod gönderir', async () => {
  api.post.mockResolvedValue({ data: { is_email_verified: true } });
  const r = await verifyEmailWithCode('654321');
  expect(api.post).toHaveBeenCalledWith('/auth/email/verify-code', { code: '654321' });
  expect(r).toEqual({ is_email_verified: true });
});
