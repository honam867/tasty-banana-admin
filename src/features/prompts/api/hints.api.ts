import { http } from '@/services/http/axios';

export type Hint = {
  id: string;
  name: string;
  type?: string;
  description?: string;
  promptTemplateIds: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ListResponse = { success: boolean; status: number; message: string; data: Hint[] };
type ItemResponse = { success: boolean; status: number; message: string; data: Hint };

export async function listHints(params?: { isActive?: boolean; type?: string; search?: string }): Promise<Hint[]> {
  const res = await http.get<ListResponse>('/hints', { params });
  return res.data?.data ?? [];
}

// Based on consistency with style-library; confirm server supports this endpoint
export async function addTemplateToHint(id: string, templateId: string): Promise<Hint> {
  const res = await http.post<ItemResponse>(`/hints/${id}/templates`, { templateId }, { headers: { 'Content-Type': 'application/json' } });
  return res.data.data;
}

export type UpdateHintDto = Partial<Pick<Hint, 'name' | 'type' | 'description' | 'isActive'>>;

export async function updateHint(id: string, dto: UpdateHintDto): Promise<Hint> {
  const res = await http.put<ItemResponse>(`/hints/${id}`, dto, { headers: { 'Content-Type': 'application/json' } });
  return res.data.data;
}

export async function deleteHint(id: string): Promise<void> {
  await http.delete(`/hints/${id}`);
}
