import { http } from '@/services/http/axios';

export type PromptTemplate = {
  id: string;
  name: string;
  prompt: string;
  previewUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ListResponse = { success: boolean; status: number; message: string; data: PromptTemplate[] };
type ItemResponse = { success: boolean; status: number; message: string; data: PromptTemplate };

export async function listPromptTemplates(params?: { isActive?: boolean; search?: string }): Promise<PromptTemplate[]> {
  const res = await http.get<ListResponse>('/prompt-templates', { params });
  return res.data?.data ?? [];
}

export type CreateTemplateDto = {
  name: string;
  prompt: string;
  previewUrl?: string;
  isActive?: boolean;
};

export async function createTemplate(dto: CreateTemplateDto): Promise<PromptTemplate> {
  const res = await http.post<ItemResponse>('/prompt-templates', dto, { headers: { 'Content-Type': 'application/json' } });
  return res.data.data;
}

export type UpdateTemplateDto = Partial<Pick<PromptTemplate, 'name' | 'prompt' | 'previewUrl' | 'isActive'>>;

export async function updateTemplate(id: string, dto: UpdateTemplateDto): Promise<PromptTemplate> {
  const res = await http.put<ItemResponse>(`/prompt-templates/${id}`, dto, { headers: { 'Content-Type': 'application/json' } });
  return res.data.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await http.delete(`/prompt-templates/${id}`);
}
