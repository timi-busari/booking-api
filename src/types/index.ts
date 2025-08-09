export interface CreateBookingRequest {
  property_id: number;
  user_name: string;
  start_date: string;
  end_date: string;
}

export interface UpdateBookingRequest {
  user_name?: string;
  start_date?: string;
  end_date?: string;
}

export interface AvailabilityRange {
  start_date: string;
  end_date: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PropertyFilters {
  available_from?: string;
  available_to?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
