import { UserRepository, SearchUserFilters, SearchUserResult } from '../../domain/entities/User';

export class SearchUsers {
  constructor(private userRepository: UserRepository) {}

  async execute(filters: SearchUserFilters): Promise<SearchUserResult> {
    // Validate that at least one filter is provided
    if (!filters.id && !filters.name && !filters.email && !filters.role) {
      throw new Error('At least one search filter must be provided');
    }

    // Validate pagination parameters
    if (filters.page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (filters.limit < 1 || filters.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    // Search users with filters
    const result = await this.userRepository.searchUsers(filters);

    return result;
  }
} 