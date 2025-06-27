export interface User {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  email: string;
  role: string;
  password: string;
  createdAt: Date;
  updatedAt?: Date;
  lastLogin?: Date;
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
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  role?: string;
  password?: string;
}

export interface DeleteUserRequest {
  reason?: string;
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
  create(user: Omit<User, 'createdAt' | 'active' | 'lastLogin'>): Promise<User>;
  findByEmail(email: string, tenantId: string): Promise<User | null>;
  findById(id: string, tenantId: string): Promise<User | null>;
  findByRole(role: string, tenantId: string): Promise<User[]>;
  searchUsers(filters: SearchUserFilters): Promise<SearchUserResult>;
  updateUser(id: string, tenantId: string, updates: UpdateUserRequest): Promise<User>;
  deleteUser(id: string, tenantId: string, data: DeleteUserRequest): Promise<boolean>;
  validateCredentials(email: string, password: string, tenantId: string): Promise<User | null>;
  updateLastLogin(id: string, tenantId: string): Promise<void>;
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

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
} 