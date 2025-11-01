import { http } from '@/services/http/axios';

export type StyleLibrary = {
  id: string;
  name: string;
  description?: string;
  promptTemplateIds: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ListResponse = { success: boolean; status: number; message: string; data: StyleLibrary[] };
type ItemResponse = { success: boolean; status: number; message: string; data: StyleLibrary };

export async function listStyleLibraries(params?: { isActive?: boolean; search?: string }): Promise<StyleLibrary[]> {
  const res = await http.get<ListResponse>('/style-library', { params });
  return res.data?.data ?? [];
}

export async function addTemplateToStyle(id: string, templateId: string): Promise<StyleLibrary> {
  const res = await http.post<ItemResponse>(`/style-library/${id}/templates`, { templateId }, { headers: { 'Content-Type': 'application/json' } });
  return res.data.data;
}

export type UpdateStyleLibraryDto = Partial<Pick<StyleLibrary, 'name' | 'description' | 'isActive'>>;

export async function updateStyleLibrary(id: string, dto: UpdateStyleLibraryDto): Promise<StyleLibrary> {
  const res = await http.put<ItemResponse>(`/style-library/${id}`, dto, { headers: { 'Content-Type': 'application/json' } });
  return res.data.data;
}

export async function deleteStyleLibrary(id: string): Promise<void> {
  await http.delete(`/style-library/${id}`);
}
