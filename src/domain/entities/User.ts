export interface User {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  email: string;
  role: string;
  createdAt: Date;
  active: boolean;
  tenantId: string;
}

export interface CreateUserRequest {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  email: string;
  role: string;
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
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserRepository {
  create(user: Omit<User, 'createdAt' | 'active'>): Promise<User>;
  findByEmail(email: string, tenantId: string): Promise<User | null>;
  findById(id: string, tenantId: string): Promise<User | null>;
  findByRole(role: string, tenantId: string): Promise<User[]>;
  searchUsers(filters: SearchUserFilters): Promise<SearchUserResult>;
}

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserValidationError';
  }
}

export class UserDuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserDuplicateError';
  }
}

export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
} 