import { UserRepository, SearchUserFilters, SearchUserResult } from '../../domain/entities/User';

export class SearchUsers {
  constructor(private userRepository: UserRepository) {}

  async execute(filters: SearchUserFilters): Promise<SearchUserResult> {
    // Validate pagination parameters
    if (filters.page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (filters.limit < 1 || filters.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    // Search users with filters (no filters means get all users)
    const result = await this.userRepository.searchUsers(filters);

    return result;
  }
} 