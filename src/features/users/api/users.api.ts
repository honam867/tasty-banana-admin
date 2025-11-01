import { http } from '@/services/http/axios';

export type UserRole = 'admin' | 'user' | 'mod' | 'warehouse' | 'owner';
export type UserStatus = 'active' | 'inactive';

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  tokenBalance?: number;
  createdAt?: string;
  updatedAt?: string;
};

type ListResponse<T> = { success?: boolean; status?: number; message?: string; data: T };

export async function listUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ items: AdminUser[]; total?: number }> {
  const res = await http.get<ListResponse<any>>('/admin/users', { params });
  const data = (res.data?.data as any) || {};
  let items: AdminUser[] = [];
  // Handle various backend shapes: { users: [...] }, { items: [...] }, direct array, or { data: [...] }
  if (Array.isArray(data)) items = data as AdminUser[];
  else if (Array.isArray(data.users)) items = data.users as AdminUser[];
  else if (Array.isArray(data.items)) items = data.items as AdminUser[];
  else if (Array.isArray(data.data)) items = data.data as AdminUser[];
  else items = [];

  const total: number | undefined =
    typeof data.total === 'number' ? data.total :
    typeof data.count === 'number' ? data.count :
    typeof data.totalCount === 'number' ? data.totalCount :
    typeof data?.pagination?.total === 'number' ? data.pagination.total :
    undefined;

  return { items, total };
}

export async function getUser(userId: string): Promise<AdminUser> {
  const res = await http.get<ListResponse<any>>(`/admin/users/${userId}`);
  const data = res.data?.data as any;
  return (data?.user as AdminUser) ?? (data as AdminUser) ?? (res.data as any);
}

export async function createUser(dto: {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
  initialTokens?: number;
}): Promise<AdminUser> {
  const res = await http.post<ListResponse<AdminUser>>('/admin/users', dto, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data?.data as any;
}

export async function updateUser(userId: string, dto: Partial<Pick<AdminUser, 'username' | 'email' | 'role' | 'status'>>): Promise<AdminUser> {
  const res = await http.put<ListResponse<AdminUser>>(`/admin/users/${userId}`, dto, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data?.data as any;
}

export async function updateUserStatus(userId: string, dto: { status: UserStatus; reason?: string }): Promise<AdminUser> {
  const res = await http.patch<ListResponse<AdminUser>>(`/admin/users/${userId}/status`, dto, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data?.data as any;
}

export async function deleteUser(userId: string, opts?: { permanent?: boolean }): Promise<void> {
  await http.delete(`/admin/users/${userId}`, { params: { permanent: opts?.permanent } });
}

export async function getTokenBalance(userId: string): Promise<{ balance: number }> {
  const res = await http.get<ListResponse<{ balance: number }>>(`/admin/users/${userId}/tokens/balance`);
  const data = res.data?.data as any;
  if (typeof data === 'number') return { balance: data };
  return { balance: data?.balance ?? 0 };
}

export type TokenHistoryItem = {
  id: string;
  amount: number; // positive credit, negative debit
  type: 'credit' | 'debit';
  reason?: string;
  notes?: string;
  createdAt?: string;
};

export async function getTokenHistory(userId: string, params?: { limit?: number; cursor?: string; type?: 'credit' | 'debit'; reason?: string }): Promise<{ items: TokenHistoryItem[]; nextCursor?: string }> {
  const res = await http.get<ListResponse<any>>(`/admin/users/${userId}/tokens/history`, { params });
  const data = (res.data?.data as any) || {};
  let items: TokenHistoryItem[] = [];
  if (Array.isArray(data)) items = data as TokenHistoryItem[];
  else if (Array.isArray(data.transactions)) items = data.transactions as TokenHistoryItem[];
  else if (Array.isArray(data.items)) items = data.items as TokenHistoryItem[];
  else if (Array.isArray(data.data)) items = data.data as TokenHistoryItem[];

  const nextCursor: string | undefined = data.nextCursor ?? data?.pagination?.cursor ?? data.cursor;
  return { items, nextCursor };
}

export async function creditTokens(userId: string, dto: { amount: number; reason?: string; notes?: string; idempotencyKey?: string }) {
  await http.post(`/admin/users/${userId}/tokens/credit`, dto, { headers: { 'Content-Type': 'application/json' } });
}

export async function debitTokens(userId: string, dto: { amount: number; reason?: string; notes?: string; idempotencyKey?: string }) {
  await http.post(`/admin/users/${userId}/tokens/debit`, dto, { headers: { 'Content-Type': 'application/json' } });
}
