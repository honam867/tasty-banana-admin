import { http } from '@/services/http/axios';

export type LoginDto = { email: string; password: string; remember?: boolean };
type BackendLoginV1 = { status: string; data?: { accessToken?: string; refreshToken?: string; user?: any }; accessToken?: string; token?: string; user?: any };

export async function login(dto: LoginDto): Promise<{ accessToken: string; user?: any }> {
  const res = await http.post<BackendLoginV1>('/auth/login', dto, {
    headers: { 'Content-Type': 'application/json' },
  });
  const body = res.data || ({} as BackendLoginV1);
  const accessToken = body?.data?.accessToken ?? body?.accessToken ?? body?.token;
  const user = body?.data?.user ?? body?.user;
  if (!accessToken) throw new Error('Invalid login response: missing token');
  return { accessToken, user };
}

export type RegisterDto = { email: string; username: string; password: string; confirmPassword: string };
export async function register(dto: RegisterDto) {
  await http.post('/auth/register', dto, { headers: { 'Content-Type': 'application/json' } });
}

export async function requestPasswordReset(dto: { email: string }) {
  await http.post('/auth/reset-password', dto, { headers: { 'Content-Type': 'application/json' } });
}

export async function changePassword(dto: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  await http.put('/auth/change-password', dto, { headers: { 'Content-Type': 'application/json' } });
}
