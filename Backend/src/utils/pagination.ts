// Backend/src/utils/pagination.ts
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  filter: {
    role?: string;
    loginType?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const getPaginationOptions = (query: any): PaginationOptions => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const search = query.search || '';

  let filter: Record<string, any> = {};
  if (query.filter) {
    try {
      filter = typeof query.filter === 'string' 
        ? JSON.parse(query.filter) 
        : query.filter;
    } catch {
      filter = {};
    }
  }

  return { page, limit, sortBy, sortOrder, search, filter };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginatedResponse<T> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};