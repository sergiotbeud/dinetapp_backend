export interface SearchUserDto {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface SearchUserFilters {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  tenantId: string;
  page: number;
  limit: number;
}

export interface SearchUserResult {
  users: Array<{
    id: string;
    name: string;
    nickname: string;
    phone: string;
    email: string;
    role: string;
    createdAt: Date;
    active: boolean;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 