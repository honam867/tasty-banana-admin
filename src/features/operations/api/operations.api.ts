import { http } from '@/services/http/axios';

export type Operation = {
  id: string;
  name: string;
  tokensPerOperation: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ListResponse = { success: boolean; status: number; message: string; data: Operation[] };
type ItemResponse = { success: boolean; status: number; message: string; data: Operation };
type OkResponse = { success: boolean; status: number; message: string; data?: any };

function normalize(op: any): Operation {
  return {
    id: op.id,
    name: op.name,
    tokensPerOperation: op.tokensPerOperation ?? op.tokens ?? 0,
    description: op.description,
    isActive: Boolean(op.isActive),
    createdAt: op.createdAt,
    updatedAt: op.updatedAt,
  };
}

export async function listOperations(): Promise<Operation[]> {
  const res = await http.get<ListResponse>('/operations');
  const data = res.data?.data ?? [];
  return data.map(normalize);
}

export async function getOperation(id: string): Promise<Operation> {
  const res = await http.get<ItemResponse>(`/operations/${id}`);
  return normalize(res.data.data);
}

export type CreateOperationDto = {
  name: string;
  tokensPerOperation: number;
  description?: string;
  isActive: boolean;
};
export async function createOperation(dto: CreateOperationDto): Promise<Operation> {
  const payload: any = {
    name: dto.name,
    tokensPerOperation: dto.tokensPerOperation,
    description: dto.description,
    isActive: dto.isActive,
  };
  const res = await http.post<ItemResponse>('/operations', payload, { headers: { 'Content-Type': 'application/json' } });
  return normalize(res.data.data);
}

export type UpdateOperationDto = {
  tokensPerOperation?: number;
  description?: string;
  isActive?: boolean;
};
export async function updateOperation(id: string, dto: UpdateOperationDto): Promise<Operation> {
  const payload: any = {
    description: dto.description,
    isActive: dto.isActive,
  };
  if (typeof dto.tokensPerOperation === 'number') {
    payload.tokensPerOperation = dto.tokensPerOperation;
  }
  const res = await http.put<ItemResponse>(`/operations/${id}`, payload, { headers: { 'Content-Type': 'application/json' } });
  return normalize(res.data.data);
}

export async function deleteOperation(id: string): Promise<OkResponse> {
  const res = await http.delete<OkResponse>(`/operations/${id}`);
  return res.data;
}
